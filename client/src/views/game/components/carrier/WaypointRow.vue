<template>
    <tr>
        <td v-if="userPlayerOwnsCarrier"><span v-if="!(isFirstWaypoint(waypoint) && isInTransit)">{{waypoint.delayTicks}}</span></td>
        <td><a href="javascript:;" @click="onOpenStarDetailRequested">{{getStarName(waypoint.destination)}}</a></td>
        <td v-if="!showAction && props.waypoint.ticksEta !== null && props.waypoint.ticksEta !== undefined">
          <timer :ticks="props.waypoint.ticksEta" />
        </td>
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
import { ref, computed } from 'vue';
import { useStore } from "vuex";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {formatAction} from "@/util/waypoint";
import Timer from "@/views/game/components/time/Timer.vue";

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
</script>

<style scoped>
input[type="number"] {
  width: 80px;
}
</style>
