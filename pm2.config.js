module.exports = {
  apps: [
    {
      name: "solaris-jobs",
      script: "npm",
      args: "run start-jobs:dev",
      cwd: "server",
      watch: false
    },
    {
      name: "solaris-api",
      script: "npm",
      args: "run start-api:dev",
      cwd: "server",
      watch: false
    },
    {
      name: "solaris-client",
      script: "npm run serve",
      cwd: "client",
      watch: false
    }
  ]
};
