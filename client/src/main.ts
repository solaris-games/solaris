import "@/assets/styles.css"
import $ from 'jquery'
import 'pixi-viewport'
import 'pixi.js'
import { Socket, io } from 'socket.io-client'
import { createApp } from 'vue'
import ToastPlugin from "vue-toast-notification"
import 'vue-toast-notification/dist/theme-default.css'
import type { Store } from "vuex/types/index.js"
import App from './App.vue'
import { ClientEventBus } from "./clientEventBus"
import { eventBusInjectionKey, type EventBus } from './eventBus'
import router from './router'
import { PlayerClientSocketEmitter, playerClientSocketEmitterInjectionKey } from './sockets/socketEmitters/player'
import { ClientHandler } from "./sockets/socketHandlers/clientHandler"
import { DiplomacyClientSocketHandler } from './sockets/socketHandlers/diplomacy'
import { GameClientSocketHandler } from './sockets/socketHandlers/game'
import { PlayerClientSocketHandler } from "./sockets/socketHandlers/player"
import { createSolarisStore, type State } from './store'
import { httpInjectionKey } from "./services/typedapi"
import {createHttpClient} from "./util/http";
import {toastInjectionKey} from "./util/keys";
import {UserClientSocketHandler} from "./sockets/socketHandlers/user";
import {UserClientSocketEmitter} from "@/sockets/socketEmitters/user";
import {userClientSocketEmitterInjectionKey} from "@/sockets/socketEmitters/user";

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

const httpClient = createHttpClient();

const store: Store<State> = createSolarisStore(eventBus, httpClient);

app.use(store);

app.use(ToastPlugin);

const socket: Socket = io(socketUrl, { withCredentials: true });

const diplomacyClientSocketHandler: DiplomacyClientSocketHandler = new DiplomacyClientSocketHandler(socket, eventBus);
const gameClientSocketHandler: GameClientSocketHandler = new GameClientSocketHandler(socket, store, app.config.globalProperties.$toast, eventBus);
const playerClientSocketHandler: PlayerClientSocketHandler = new PlayerClientSocketHandler(socket, store, eventBus);
const userClientSocketHandler: UserClientSocketHandler = new UserClientSocketHandler(socket, store, eventBus);
const playerClientSocketEmitter: PlayerClientSocketEmitter = new PlayerClientSocketEmitter(socket);
const userClientSocketEmitter: UserClientSocketEmitter = new UserClientSocketEmitter(socket);

app.provide(userClientSocketEmitterInjectionKey, userClientSocketEmitter);
app.provide(playerClientSocketEmitterInjectionKey, playerClientSocketEmitter);
app.provide(eventBusInjectionKey, eventBus);

app.provide(httpInjectionKey, httpClient);

app.provide(toastInjectionKey, app.config.globalProperties.$toast);

const clientHandler: ClientHandler = new ClientHandler(socket, store, playerClientSocketEmitter, userClientSocketEmitter);

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
