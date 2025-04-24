<template>
  <div id="gameContainer" ref="el"></div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, type Ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import type { Store } from 'vuex/types/index.js';
import { eventBusInjectionKey, type EventBus } from '../../../eventBus'
import type { TempWaypoint } from "../../../types/waypoint";
import MapEventBusEventNames, { type ObjectClicked } from '../../../eventBusEventNames/map';
import type { Carrier, Game, Star } from '../../../types/game';
import type { ToastPluginApi } from 'vue-toast-notification';
import type { State } from '../../../store';
import { toastInjectionKey } from '../../../util/keys';
import GameApiService from '../../../services/api/game'
import { attachEventDeduplication } from "../../../util/eventDeduplication";
import MapCommandEventBusEventNames from "../../../eventBusEventNames/mapCommand";
import {createGameContainer} from "@/game/container";

const store = useStore() as Store<State>;

const eventBus = inject(eventBusInjectionKey)!;
const toast: ToastPluginApi = inject(toastInjectionKey)!;

const emit = defineEmits<{
  onStarClicked: [starId: string],
  onStarRightClicked: [starId: string],
  onCarrierClicked: [carrierId: string],
  onCarrierRightClicked: [carrierId: string],
  onWaypointCreated: [waypoint: TempWaypoint],
  onObjectsClicked: [objects: ObjectClicked[]]
}>();

const polling = ref(0);
const el: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  const game = store.state.game!;

  createGameContainer(store, store.state.settings, (msg) => toast.error(msg), eventBus).then((gameContainer) => {
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

    const loadGame = (game: Game) => {
      gameContainer.setup(game, store.state.settings)
    };

    const drawGame = (game: Game, panToUser = true) => {
      gameContainer.draw()

      if (panToUser) {
        eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToUser, {});
      }
    };

    const touchPlayer = async () => {
      try {
        await GameApiService.touchPlayer(store.state.game!._id)
      } catch (e) {
        console.error(e)
      }
    };

    const updateGame = (game: Game | null) => {
      if (game) {
        gameContainer.reloadGame(game, store.state.settings);
      }
    };

    const onStarClickedHandler = ({ star }: { star: Star }) => {
      emit("onStarClicked", star._id);
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

    const onWaypointCreatedHandler = ({ waypoint }: { waypoint: TempWaypoint }) => {
      emit("onWaypointCreated", waypoint);
    };

    const onObjectsClickedHandler = ({ objects }: { objects: ObjectClicked[] }) => {
      emit("onObjectsClicked", objects);
    };

    watch(computed(() => store.state.game), (newGame) => updateGame(newGame));

    window.addEventListener('resize', handleResize)

    checkPerformance();

    loadGame(game);

    const canvas = gameContainer.app!.canvas;
    el.value?.appendChild(canvas);
    drawGame(game);

    const gameRoot = document.getElementById("gameRoot"); // Defined in Game component
    attachEventDeduplication(gameRoot, canvas);

    eventBus.on(MapEventBusEventNames.MapOnStarClicked, onStarClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnStarRightClicked, onStarRightClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnCarrierClicked, onCarrierClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnCarrierRightClicked, onCarrierRightClickedHandler);
    eventBus.on(MapEventBusEventNames.MapOnWaypointCreated, onWaypointCreatedHandler);
    eventBus.on(MapEventBusEventNames.MapOnObjectsClicked, onObjectsClickedHandler);

    if (store.state.userId) {
      polling.value = setInterval(touchPlayer, 60000);
      touchPlayer();
    }

    onBeforeUnmount(() => {
      clearInterval(polling.value);

      gameContainer.destroy();

      eventBus.off(MapEventBusEventNames.MapOnStarClicked, onStarClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnStarRightClicked, onStarRightClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnCarrierClicked, onCarrierClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnCarrierRightClicked, onCarrierRightClickedHandler);
      eventBus.off(MapEventBusEventNames.MapOnWaypointCreated, onWaypointCreatedHandler);
      eventBus.off(MapEventBusEventNames.MapOnObjectsClicked, onObjectsClickedHandler);
    });
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
}
</style>
