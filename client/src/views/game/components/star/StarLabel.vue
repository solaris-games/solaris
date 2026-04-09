<template>
  <a href="javascript:;" @click="pan">{{actualStarName}}<i class="fas fa-eye ms-1"></i></a>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import gameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject, computed } from 'vue';
import GameHelper from "../../../../services/gameHelper";
import type {MapObject} from "@solaris/common";

const props = defineProps<{
  starId: string,
  starName?: string | null | undefined,
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useGameStore();
const game = computed(() => store.game!);

const actualStarName = computed(() => {
  if (props.starName) {
    return props.starName;
  } else {
    const star = GameHelper.getStarById(game.value, props.starId);

    return star ? star.name : 'Unknown';
  }
});

const pan = () => {
  const star = gameHelper.getStarById(game.value, props.starId);

  if (star) {
    eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, {
      object: star as MapObject<string>,
    });
  }
}
</script>

<style scoped>
</style>
