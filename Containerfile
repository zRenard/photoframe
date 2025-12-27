# Build arguments that can be overridden from command line
ARG NODE_VERSION=22.9.0
ARG SKIP_NPM_UPDATE=false

# Build stage
FROM docker.io/node:${NODE_VERSION}-slim AS build

# Ensure all packages are up-to-date to reduce vulnerabilities
RUN set -eux; \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get dist-upgrade -y && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        curl \
        ca-certificates \
        && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install build dependencies with retry and certificate handling
RUN set -eux; \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        curl \
        ca-certificates \
        && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Remove node_modules and package-lock.json to avoid npm/rollup native module bug
RUN rm -rf node_modules package-lock.json

# Install all dependencies including devDependencies for building
RUN npm install --prefer-offline --no-audit

# Conditionally upgrade npm based on build argument
RUN if [ "$SKIP_NPM_UPDATE" = "false" ]; then \
        npm install -g npm@latest; \
    else \
        echo "Skipping npm update as requested"; \
    fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM docker.io/node:${NODE_VERSION}-slim

WORKDIR /app

RUN set -eux; \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        tini \
        curl \
        ca-certificates \
        && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user and set permissions
RUN groupadd -r appgroup && \
    useradd -r -g appgroup appuser && \
    mkdir -p /app/public/photos && \
    chown -R appuser:appgroup /app

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production --prefer-offline --no-audit && \
    npm cache clean --force

# Copy built files from build stage
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/public ./public
COPY --chown=appuser:appgroup server.js .

# Create health check script
RUN echo '#!/bin/sh' > /app/healthcheck.sh && \
    echo 'curl -f http://localhost:3001/api/test || exit 1' >> /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh && \
    chown appuser:appgroup /app/healthcheck.sh

# Switch to non-root user
USER appuser

# Add labels for OCI-compatible health checks
# These labels are recognized by Podman, CRI-O, and other OCI-compatible runtimes
LABEL io.containers.healthcheck.interval=30s \
      io.containers.healthcheck.timeout=3s \
      io.containers.healthcheck.startperiod=5s \
      io.containers.healthcheck.retries=3 \
      io.containers.healthcheck.test="/bin/sh -c /app/healthcheck.sh"

# Expose port (only the one we actually use)
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    NODE_OPTIONS=--openssl-legacy-provider

# Use tini as init process for better signal handling
ENTRYPOINT ["/usr/bin/tini", "--"]

# Start the application
CMD ["node", "server.js"]
