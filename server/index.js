const express = require('express');
const loaders = require('./loaders');
const config = require('./config');

async function startServer() {
  const app = express();

  await loaders.init(app);

  app.listen(config.port, err => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(`Server is running on port ${config.port}`);
  });
}

startServer();
