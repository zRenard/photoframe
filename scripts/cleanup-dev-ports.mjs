import { execFileSync, execSync } from 'node:child_process';
import os from 'node:os';

const ports = process.argv.slice(2)
  .map(value => Number.parseInt(value, 10))
  .filter(Number.isInteger);

if (ports.length === 0) {
  console.error('No ports provided.');
  process.exit(1);
}

function getPidsForPort(port) {
  if (os.platform() === 'win32') {
    const output = execSync('netstat -ano', { encoding: 'utf8' });
    const lines = output.split(/\r?\n/);
    const portSuffix = `:${port}`;
    const pids = new Set();

    for (const line of lines) {
      if (!line.includes('LISTENING') || !line.includes(portSuffix)) {
        continue;
      }

      const columns = line.trim().split(/\s+/);
      const localAddress = columns[1];
      const pid = Number.parseInt(columns.at(-1), 10);

      if (localAddress?.endsWith(portSuffix) && Number.isInteger(pid)) {
        pids.add(pid);
      }
    }

    return [...pids];
  }

  try {
    const output = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim();
    if (!output) {
      return [];
    }

    return output
      .split(/\r?\n/)
      .map(value => Number.parseInt(value, 10))
      .filter(Number.isInteger);
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (os.platform() === 'win32') {
    execFileSync('taskkill', ['/PID', String(pid), '/F', '/T'], { stdio: 'ignore' });
    return;
  }

  process.kill(pid, 'SIGKILL');
}

for (const port of ports) {
  const pids = getPidsForPort(port);

  if (pids.length === 0) {
    continue;
  }

  for (const pid of pids) {
    try {
      killPid(pid);
      console.log(`Stopped process ${pid} on port ${port}`);
    } catch (error) {
      console.warn(`Failed to stop process ${pid} on port ${port}: ${error.message}`);
    }
  }
}