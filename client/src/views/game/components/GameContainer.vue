<template>
  <div id="gameContainer" ref="el"></div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, type Ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import type { Store } from 'vuex/types/index.js';
import { eventBusInjectionKey } from '../../../eventBus'
import MapEventBusEventNames, { type ObjectClicked, type OnPreStarParams } from '../../../eventBusEventNames/map';
import type { Carrier, Game, Star } from '../../../types/game';
import type { ToastPluginApi } from 'vue-toast-notification';
import type { State } from '../../../store';
import { toastInjectionKey } from '../../../util/keys';
import { attachEventDeduplication } from "../../../util/eventDeduplication";
import MapCommandEventBusEventNames from "../../../eventBusEventNames/mapCommand";
import {createGameContainer} from "@/game/container";
import { StoreDrawingContext } from './StoreDrawingContext';
import {touch} from "@/services/typedapi/game";
import {httpInjectionKey, isError} from "@/services/typedapi";

const store = useStore() as Store<State>;

const eventBus = inject(eventBusInjectionKey)!;
const toast: ToastPluginApi = inject(toastInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const emit = defineEmits<{
  onStarClicked: [starId: string],
  onStarRightClicked: [starId: string],
  onCarrierClicked: [carrierId: string],
  onCarrierRightClicked: [carrierId: string],
  onObjectsClicked: [objects: ObjectClicked[]]
}>();

const polling = ref(0);
const el: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  let unsubscribe;

  createGameContainer(new StoreDrawingContext(store), store.state.game!, store.state.settings!, (msg) => toast.error(msg), eventBus).then((gameContainer) => {
    const checkPerformance = () => {
      const webGLSupport = gameContainer.checkPerformance();

      console.log("WebGL Support", webGLSupport);

      if (!webGLSupport.webgl) {
        toast.error('WebGL is not supported on your device', { duration: 10000 });
      }

      if (webGLSupport.webgl && !webGLSupport.performance) {
        toast.info('Low-performance mode detected. You may consider lowering your graphics settings.', { duration: 10000 });
      }
    };

    const handleResize = (e) => {
      gameContainer.resize();
    };

    const drawGame = () => {
      gameContainer.draw()
      eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToUser, {});
    };

    const touchPlayer = async () => {
      try {
        if (store.state.game && store.state.userId) {
          const response = await touch(httpClient)(store.state.game._id);

          if (isError(response)) {
            console.error(response);
          }
        }
      } catch (e) {
        console.error(e)
      }
    };

    const updateGame = (game: Game | null) => {
      if (game) {
        gameContainer.reloadGame(game, store.state.settings!);
      }
    };

    const onStarClickedHandler = ({ star }: { star: Star }) => {
      emit("onStarClicked", star._id);
    };

    const onPreStarClickedHandler = (params: OnPreStarParams) => {
      store.commit('starClicked', params);
    };

    const onPreStarRightClickedHandler = (params: OnPreStarParams) => {
      store.commit('starRightClicked', params);
    };

    const onStarRightClickedHandler = ({ star }: { star: Star }) => {
      emit("onStarRightClicked", star._id);
    };

    const onCarrierClickedHandler = ({ carrier }: { carrier: Carrier }) => {
      emit("onCarrierClicked", carrier._id);
    };

    const onCarrierRightClickedHandler = ({ carrier }: { carrier: Carrier }) => {
      emit("onCarrierRightClicked", carrier._id);
    };

    const onObjectsClickedHandler = ({ objects }: { objects: ObjectClicked[] }) => {
      emit("onObjectsClicked", objects);
    };

    const unwatch = watch(computed(() => store.state.game), (newGame) => {
      updateGame(newGame)
    }); // watcher is created async, so we have to do the cleanup ourselves

    window.addEventListener('resize', handleResize)

    checkPerformance();

    const canvas = gameContainer.app!.canvas;
    el.value?.appendChild(canvas);
    drawGame();

    const gameRoot = document.getElementById("gameRoot"); // Defined in Game component
    attachEventDeduplication(gameRoot, canvas);

    eventBus.on(MapEventBusEventNames.MapOnPreStarClicked, onPreStarClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnStarClicked, onStarClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnPreStarRightClicked, onPreStarRightClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnStarRightClicked, onStarRightClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnCarrierClicked, onCarrierClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnCarrierRightClicked, onCarrierRightClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnObjectsClicked, onObjectsClickedHandler);

    if (store.state.userId) {
      polling.value = setInterval(touchPlayer, 60000);
      touchPlayer();
    }

    unsubscribe = () => {
      unwatch();

      window.removeEventListener('resize', handleResize);

      clearInterval(polling.value);

      gameContainer.destroy();

      eventBus.off(MapEventBusEventNames.MapOnPreStarClicked, onPreStarClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnStarClicked, onStarClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnPreStarRightClicked, onPreStarRightClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnStarRightClicked, onStarRightClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnCarrierClicked, onCarrierClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnCarrierRightClicked, onCarrierRightClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnObjectsClicked, onObjectsClickedHandler);
    };
  });

  onBeforeUnmount(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
});
</script>
<style scoped>
#gameContainer {
  position: absolute;
  left: 0;
  top: 45px;
  margin: 0;
  height: calc(100% - 52px);
  width: 100%;
  overflow: hidden;
  user-select: none;
}
</style>
