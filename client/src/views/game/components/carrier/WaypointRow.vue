<template>
    <tr>
        <td v-if="userPlayerOwnsCarrier"><span v-if="!(isFirstWaypoint(waypoint) && isInTransit)">{{waypoint.delayTicks}}</span></td>
        <td><a href="javascript:;" @click="onOpenStarDetailRequested">{{getStarName(waypoint.destination)}}</a></td>
        <td v-if="!showAction">{{timeRemainingEta}}</td>
        <td v-if="showAction">
            <span>{{formatAction(waypoint, waypoint.action)}}</span>
        </td>
        <td class="text-end" v-if="!isHistoricalMode && canEditWaypoints">
          <a href="javascript:;" @click="editWaypoint">Edit</a>
        </td>
    </tr>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper';
import type {Carrier, Game} from "@/types/game";
import type {CarrierWaypoint} from "@solaris-common";
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from "vuex";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {formatAction} from "@/util/waypoint";

const props = defineProps<{
  carrier: Carrier,
  waypoint: CarrierWaypoint<string>,
  showAction: boolean,
}>();

const emit = defineEmits<{
  onEditWaypointRequested: [waypoint: CarrierWaypoint<string>],
  onOpenStarDetailRequested: [starId: string],
}>();

const store = useStore();
const isHistoricalMode = useIsHistoricalMode(store);
const game = computed<Game>(() => store.state.game);

const timeRemainingEta = ref<string | null>(null);

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const userPlayerOwnsCarrier = computed(() => userPlayer.value && GameHelper.getCarrierOwningPlayer(game.value, props.carrier)!._id === userPlayer.value._id);
const canEditWaypoints = computed(() => !GameHelper.isGameFinished(game.value) && userPlayerOwnsCarrier.value && !props.carrier.isGift);
const isInTransit = computed(() => !props.carrier.orbiting);

const getStarName = (starId: string) => GameHelper.getStarById(game.value, starId)!.name;

const onOpenStarDetailRequested = () => emit('onOpenStarDetailRequested', props.waypoint.destination);

const editWaypoint = () => emit('onEditWaypointRequested', props.waypoint);

const isFirstWaypoint = (waypoint: CarrierWaypoint<string>) => {
  return props.carrier.waypoints.indexOf(waypoint) === 0;
};

const recalculateTimeRemaining = () => {
  timeRemainingEta.value = GameHelper.getCountdownTimeStringByTicks(game.value, props.waypoint.ticksEta);
};

onMounted(() => {
  recalculateTimeRemaining();

  let handle;

  if (GameHelper.isGameInProgress(game.value) || GameHelper.isGamePendingStart(game.value)) {
    handle = setInterval(recalculateTimeRemaining, 250);
  }

  onUnmounted(() => {
    handle && clearInterval(handle);
  });
});
</script>

<style scoped>
input[type="number"] {
  width: 80px;
}
</style>
