import "@/assets/styles.css"
import $ from 'jquery'
import 'pixi-viewport'
import 'pixi.js'
import { io } from 'socket.io-client'
import { createApp } from 'vue'
import ToastPlugin from "vue-toast-notification"
import 'vue-toast-notification/dist/theme-default.css'
import App from './App.vue'
import { ClientEventBus } from "./clientEventBus"
import { eventBusInjectionKey, type EventBus } from './eventBus'
import router from './router'
import GameHelper from './services/gameHelper'
import { PlayerClientSocketEmitter, playerClientSocketEmitterInjectionKey } from './socketEmitters/player'
import { DiplomacyClientSocketHandler } from './socketHandlers/diplomacy'
import { GameClientSocketHandler } from './socketHandlers/game'
import { PlayerClientSocketHandler } from "./socketHandlers/player"
import { createSolarisStore } from './store'

// Note: This was done to get around an issue where the Steam client
// had bootstrap as undefined. This also affects the UI template we're using,
// we are forced to bring in Bootstrap and FontAwesome manually as a dependency
// instead of using the vendor files provided by the template.
// DO NOT use top-level await since that silently breaks the bundle
import('bootstrap/dist/js/bootstrap.bundle.js').then((mod) => window.bootstrap = mod);
declare var bootstrap: any; // Hnnngh.
import('../public/assets/js/app.min.js')

const socketUrl: string = import.meta.env.VUE_APP_SOCKETS_HOST;

window.$ = $;

window._solaris = {
  errors: []
};

const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
  if (err instanceof Error) {
    window._solaris.errors.push(`Vue error: ${err.message}\n ${err.cause} ${info}\n ${err.stack}`);
  }
  else {
    window._solaris.errors.push(`Unknown error: ${err}`);
  }

  console.error(err);
};

window.addEventListener("error", (ev) => {
  window._solaris.errors.push(ev.error + ' ' + ev.message);
});

window.addEventListener("unhandledrejection", (event) => {
  window._solaris.errors.push(event.reason);
  reportError(event.reason);
});

const eventBus: EventBus = new ClientEventBus();

let store = createSolarisStore(eventBus);

app.use(store);

app.use(ToastPlugin);

let socket = io(socketUrl, { withCredentials: true });

socket.on('connect', () => {
  console.log('Socket connection established.');
});

socket.io.on('error', e => {
  console.error('Socket.io error.');
  console.error(e);
});

export const diplomacyClientSocketHandler: DiplomacyClientSocketHandler = new DiplomacyClientSocketHandler(socket, eventBus);
export const gameClientSocketHandler: GameClientSocketHandler = new GameClientSocketHandler(socket, store, app.config.globalProperties.$toast, eventBus);
export const playerClientSocketHandler: PlayerClientSocketHandler = new PlayerClientSocketHandler(socket, store, eventBus);

const playerClientSocketEmitter: PlayerClientSocketEmitter = new PlayerClientSocketEmitter(socket);

app.provide(playerClientSocketEmitterInjectionKey, playerClientSocketEmitter);
app.provide(eventBusInjectionKey, eventBus);

socket.io.on('reconnect', () => {
  let gameId = store.state.game?._id;

  if (gameId != null) {
    let player = GameHelper.getUserPlayer(store.state.game)

    console.log('Rejoining game room.');

    playerClientSocketEmitter.emitGameRoomJoined({
      gameId: gameId,
      playerId: player?._id
    });
  }
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
