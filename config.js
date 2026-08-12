{
  "packageRules": [
    {
      "description": "Automerge non-major updates",
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ]
  "extends": [
    "config:recommended", 
    "docker:pinDigests", 
    "helpers:pinGitHubActionDigests", 
    ":configMigration", 
    ":pinAllExceptPeerDependencies", 
    "abandonments:recommended", 
    "security:minimumReleaseAgeNpm", 
    ":maintainLockFilesWeekly",
    ":dependencyDashboard", 
    ":semanticPrefixFixDepsChoreOthers", 
    ":ignoreModulesAndTests", 
    "group:monorepos", 
    "group:recommended", 
    "mergeConfidence:age-confidence-badges", 
    "replacements:all", 
    "workarounds:all", 
    "helpers:forgejoDigestChangelogs", 
    "helpers:giteaDigestChangelogs", 
    "helpers:githubDigestChangelogs", 
    "helpers:gitlabDigestChangelogs", 
    "helpers:goXPackagesChangelogLink", 
    "helpers:goXPackagesNameLink", 
    "helpers:renovateChangelog" 
  ]
}
