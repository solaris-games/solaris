<template>
  <div id="gameContainer" ref="el"></div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, type Ref, watch, computed } from 'vue';
import { eventBusInjectionKey } from '../../../eventBus'
import type { Carrier, Game, Star } from '../../../types/game';
import { attachEventDeduplication } from "../../../util/eventDeduplication";
import { createGameContainer, type Services, MapEventBusEventNames, type ObjectClicked, type StarClickDispatchArgs, MapCommandEventBusEventNames } from '@solaris/map-rendering'
import { mapTextureUrls } from './textureUrls';
import { StoreDrawingContext } from './StoreDrawingContext';
import {touch} from "@/services/typedapi/game";
import {httpInjectionKey, isError} from "@/services/typedapi";
import {useGameServices} from "@/util/gameServices";
import { useUserStore } from '@/stores/user';
import {useGameStore} from "@/stores/game";

import { useToast } from 'vue-toast-notification';
import GameHelper from "@/services/gameHelper.ts";
import {GameTooltips} from "@/views/game/components/tooltips.ts";
import type {CarrierClickDispatchArgs} from "@solaris/map-rendering";
import {useMapClickStore} from "@/stores/mapClick.ts";
const store = useGameStore();
const userStore = useUserStore();
const mapClickStore = useMapClickStore();

const eventBus = inject(eventBusInjectionKey)!;
const toast = useToast();
const httpClient = inject(httpInjectionKey)!;

const serviceProvider = useGameServices();

const emit = defineEmits<{
  onStarSelected: [starId: string],
  onStarRightSelected: [starId: string],
  onCarrierSelected: [carrierId: string],
  onCarrierRightSelected: [carrierId: string],
  onObjectsClicked: [objects: ObjectClicked[]]
}>();

const polling = ref(0);
const el: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  let unsubscribe;

  const services: Services = {
    starDataService: serviceProvider.starDataService,
    gameTypeService: serviceProvider.gameTypeService,
    distanceService: serviceProvider.distanceService,
    pathfindingService: serviceProvider.pathfindingService,
    tooltips: new GameTooltips(),
    technologyService: serviceProvider.technologyService,
  };

  createGameContainer(services, new StoreDrawingContext(store), store.game!, store.settings!, (msg) => toast.error(msg), eventBus, mapTextureUrls).then((gameContainer) => {
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

    const handleResize = () => {
      gameContainer.resize();
    };

    const drawGame = () => {
      gameContainer.draw()
      eventBus.emit(MapCommandEventBusEventNames.MapCommandInitialPanForPlayer, {
        player: GameHelper.getUserPlayer(store.game!),
      });
    };

    const touchPlayer = async () => {
      try {
        if (store.game && userStore.userId) {
          const response = await touch(httpClient)(store.game._id);

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
        gameContainer.reloadGame(game, store.settings!);
      }
    };

    const onStarSelectedHandler = ({ star }: { star: Star }) => {
      emit("onStarSelected", star._id);
    };

    const onStarClickDispatchHandler = (args: StarClickDispatchArgs) => {
      mapClickStore.onStarClick(args);
    };

    const onStarRightClickDispatchHandler = (args: StarClickDispatchArgs) => {
      mapClickStore.onStarRightClick(args);
    };

    const onCarrierClickDispatchHandler = (args: CarrierClickDispatchArgs) => {
      mapClickStore.onCarrierClick(args);
    };

    const onCarrierRightClickDispatchHandler = (args: CarrierClickDispatchArgs) => {
      mapClickStore.onCarrierRightClick(args);
    };

    const onStarRightSelected = ({ star }: { star: Star }) => {
      emit("onStarRightSelected", star._id);
    };

    const onCarrierSelectedHandler = ({ carrier }: { carrier: Carrier }) => {
      emit("onCarrierSelected", carrier._id);
    };

    const onCarrierRightSelectedHandler = ({ carrier }: { carrier: Carrier }) => {
      emit("onCarrierRightSelected", carrier._id);
    };

    const onObjectsClickedHandler = ({ objects }: { objects: ObjectClicked[] }) => {
      emit("onObjectsClicked", objects);
    };

    const unwatch = watch(computed(() => store.game), (newGame) => {
      updateGame(newGame);
    }); // watcher is created async, so we have to do the cleanup ourselves

    window.addEventListener('resize', handleResize);

    checkPerformance();

    const canvas = gameContainer.app!.canvas;
    el.value?.appendChild(canvas);
    drawGame();

    const gameRoot = document.getElementById("gameRoot"); // Defined in Game component
    attachEventDeduplication(gameRoot, canvas);

    eventBus.on(MapEventBusEventNames.MapOnStarClickDispatched, onStarClickDispatchHandler);
    eventBus.on(MapEventBusEventNames.MapOnStarSelected, onStarSelectedHandler);
    eventBus.on(MapEventBusEventNames.MapOnStarRightClickDispatched, onStarRightClickDispatchHandler);
    eventBus.on(MapEventBusEventNames.MapOnStarRightSelected, onStarRightSelected);
    eventBus.on(MapEventBusEventNames.MapOnCarrierClickDispatched, onCarrierClickDispatchHandler);
    eventBus.on(MapEventBusEventNames.MapOnCarrierRightClickDispatched, onCarrierRightClickDispatchHandler);
    eventBus.on(MapEventBusEventNames.MapOnCarrierSelected, onCarrierSelectedHandler);
    eventBus.on(MapEventBusEventNames.MapOnCarrierRightSelected, onCarrierRightSelectedHandler);
    eventBus.on(MapEventBusEventNames.MapOnObjectsClicked, onObjectsClickedHandler);

    if (userStore.userId) {
      polling.value = setInterval(touchPlayer, 60000);
      touchPlayer();
    }

    unsubscribe = () => {
      unwatch();

      window.removeEventListener('resize', handleResize);

      clearInterval(polling.value);

      gameContainer.destroy();

      eventBus.off(MapEventBusEventNames.MapOnStarClickDispatched, onStarClickDispatchHandler);
      eventBus.off(MapEventBusEventNames.MapOnStarSelected, onStarSelectedHandler);
      eventBus.off(MapEventBusEventNames.MapOnStarRightClickDispatched, onStarRightClickDispatchHandler);
      eventBus.off(MapEventBusEventNames.MapOnStarRightSelected, onStarRightSelected);
      eventBus.off(MapEventBusEventNames.MapOnCarrierClickDispatched, onCarrierClickDispatchHandler);
      eventBus.off(MapEventBusEventNames.MapOnCarrierRightClickDispatched, onCarrierRightClickDispatchHandler);
      eventBus.off(MapEventBusEventNames.MapOnCarrierSelected, onCarrierSelectedHandler);
      eventBus.off(MapEventBusEventNames.MapOnCarrierRightSelected, onCarrierRightSelectedHandler);
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
