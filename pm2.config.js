module.exports = {
  apps: [
    {
      name: "solaris-jobs",
      script: "server/jobs/index.js",
      watch: true,
      node_args: "--inspect=9230"
    },
    {
      name: "solaris-api",
      script: "server/api/index.js",
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
