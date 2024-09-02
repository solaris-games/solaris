import {createApp} from 'vue'
import VueSocketio from 'vue-socket.io' // NOTE: There is an issue with >3.0.7 so forced to use 3.0.7, see here: https://stackoverflow.com/questions/61769716/vue-socket-connection-not-triggered
import Toasted from 'vue-toasted'
import App from './App.vue'
import router from './router'
import store from './store'
import { init as initSocket } from './socket'

import $ from 'jquery'
import 'pixi.js-legacy'
import 'pixi-viewport'
import '@pixi/graphics-extras';

// Note: This was done to get around an issue where the Steam client
// had bootstrap as undefined. This also affects the UI template we're using,
// we are forced to bring in Bootstrap and FontAwesome manually as a dependency
// instead of using the vendor files provided by the template.
window.bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.js');
await import('../public/assets/js/app.min.js')

window.$ = $;

window._solaris = {
  errors: []
};

const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
  window._solaris.errors.push(`Vue error: ${err.message}\n ${err.cause} ${info}\n ${err.stack}`);

  console.error(err);
};

window.addEventListener("error", (ev) => {
  window._solaris.errors.push(ev.error + ' ' + ev.message);
});

window.addEventListener("unhandledrejection", (event) => {
  window._solaris.errors.push(event.error + ' ' + event.reason);
});

app.use(store);

app.use(initSocket(store))

app.use(new VueSocketio({
  debug: true,
  connection: `//${import.meta.env.VUE_APP_SOCKETS_HOST}`,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
}));

app.use(Toasted, {
  position: 'bottom-right',
  duration: 2500
});

app.config.globalProperties.$confirm = async function(title, text, confirmText = 'Yes', cancelText = 'No', hideCancelButton = false, cover = false) {
  return this.$store.dispatch('confirm', {
    titleText: title,
    text,
    confirmText,
    cancelText,
    hideCancelButton,
    cover
  })
}

app.config.globalProperties.$isHistoricalMode = function() {
  return this.$store.state.tick !== this.$store.state.game.state.tick
}

app.config.globalProperties.$isMobile = function () {
  return window.matchMedia('only screen and (max-width: 576px)').matches
}

app.directive('tooltip', function(el, binding) {
  new bootstrap.Tooltip($(el), {
    title: binding.value,
    placement: binding.arg,
    trigger: 'hover'
  })
})

app.use(router);

app.mount('#app');
