const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    client: {
      progress: false,
    }
  }
})
