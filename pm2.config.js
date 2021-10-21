module.exports = {
  apps: [
    {
      name: "solaris-jobs",
      script: "jobs/index.js",
      cwd: "server",
      watch: true,
      node_args: "--inspect=9230"
    },
    {
      name: "solaris-api",
      script: "api/index.js",
      cwd: "server",
      watch: true,
      node_args: "--inspect=9231"
    },
    {
      name: "solaris-client",
      script: "npm run serve",
      cwd: "client",
      watch: false
    }
  ]
};
