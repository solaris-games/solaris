import Vue from 'vue'
import VueSocketio from 'vue-socket.io' // NOTE: There is an issue with >3.0.7 so forced to use 3.0.7, see here: https://stackoverflow.com/questions/61769716/vue-socket-connection-not-triggered
import Toasted from 'vue-toasted'
import App from './App.vue'
import router from './router'
import store from './store'

import $ from 'jquery'
import 'pixi.js-legacy'
import 'pixi-viewport'

// Note: This was done to get around an issue where the Steam client
// had bootstrap as undefined. This also affects the UI template we're using,
// we are forced to bring in Bootstrap and FontAwesome manually as a dependency 
// instead of using the vendor files provided by the template.
window.bootstrap = require('bootstrap/dist/js/bootstrap.bundle.js');
require('../public/assets/js/app.min.js')

Vue.config.productionTip = false
window.$ = $;

Vue.use(new VueSocketio({
  debug: true,
  connection: `//${process.env.VUE_APP_SOCKETS_HOST}`,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
}))

Vue.use(Toasted, {
  position: 'bottom-right',
  duration: 2500
})

Vue.prototype.$confirm = async function(title, text, confirmText = 'Yes', cancelText = 'No', hideCancelButton = false, cover = false) {
  return this.$store.dispatch('confirm', {
    titleText: title,
    text,
    confirmText,
    cancelText,
    hideCancelButton,
    cover
  })
}

Vue.prototype.$isHistoricalMode = function() {
  return this.$store.state.tick !== this.$store.state.game.state.tick
}

Vue.prototype.$isMobile = function () {
  return window.matchMedia('only screen and (max-width: 576px)').matches
}

Vue.directive('tooltip', function(el, binding) {
  new bootstrap.Tooltip($(el), {
    title: binding.value,
    placement: binding.arg,
    trigger: 'hover'
  })
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
