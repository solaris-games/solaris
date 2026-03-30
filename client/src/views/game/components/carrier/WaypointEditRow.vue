<template>
  <tr v-if="waypoint">
    <td class="waypoint-element">
      <input type="number" class="form-control form-control-sm"
             v-if="!(isFirstWaypoint(allWaypoints, waypoint) && isInTransit)" v-model="waypoint.delayTicks"
             @change="onChanged">
    </td>
    <td class="waypoint-element pt-2">
      <span>{{ getStarName(waypoint.destination) }}</span>
    </td>
    <td class="waypoint-element">
      <select class="form-control form-control-sm" v-model="waypoint.action" @change="onChanged">
        <option key="nothing" value="nothing">{{ formatAction(waypoint, 'nothing') }}</option>
        <option key="collectAll" value="collectAll">{{ formatAction(waypoint, 'collectAll') }}</option>
        <option key="dropAll" value="dropAll">{{ formatAction(waypoint, 'dropAll') }}</option>
        <option key="collect" value="collect">{{ formatAction(waypoint, 'collect') }}</option>
        <option key="drop" value="drop">{{ formatAction(waypoint, 'drop') }}</option>
        <option key="collectAllBut" value="collectAllBut">{{ formatAction(waypoint, 'collectAllBut') }}</option>
        <option key="dropAllBut" value="dropAllBut">{{ formatAction(waypoint, 'dropAllBut') }}</option>
        <option key="garrison" value="garrison">{{ formatAction(waypoint, 'garrison') }}</option>
        <option key="collectPercentage" value="collectPercentage">{{ formatAction(waypoint, 'collectPercentage') }}
        </option>
        <option key="dropPercentage" value="dropPercentage">{{ formatAction(waypoint, 'dropPercentage') }}</option>
      </select>
    </td>
    <td class="waypoint-element">
      <input v-if="isActionRequiresShips(waypoint.action)" class="form-control form-control-sm" type="number"
             v-model="waypoint.actionShips"/>
    </td>
  </tr>
</template>
<script setup lang="ts">
import {computed} from 'vue';
import type {CarrierWaypoint} from "@solaris-common";
import {formatAction, isActionRequiresShips, isFirstWaypoint} from "@/util/waypoint";
import GameHelper from "@/services/gameHelper";
import type {Game} from "@/types/game";

const props = defineProps<{
  isInTransit: boolean,
  waypoint: CarrierWaypoint<string>,
  allWaypoints: CarrierWaypoint<string>[],
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const onChanged = () => emit('onWaypointUpdated', props.waypoint);

const emit = defineEmits<{
  onWaypointUpdated: [waypoint: CarrierWaypoint<string>],
}>();

const getStarName = (starId: string) => {
  const star = GameHelper.getStarById(game.value, starId);
  return star ? star.name : 'Unknown Star';
};
</script>
<style scoped>
.waypoint-element {
  text-align: center;
}
</style>
