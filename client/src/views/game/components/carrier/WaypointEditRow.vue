<template>
  <div class="row g-0 mb-2" v-if="waypoint">
    <div class="col-2 text-center">
      <input type="number" class="form-control form-control-sm" v-if="!(isFirstWaypoint(allWaypoints, waypoint) && isInTransit)" v-model="waypoint.delayTicks" @change="onChanged">
    </div>
    <div class="col-3 text-center pt-1">
      <span>{{getStarName(waypoint.destination)}}</span>
    </div>
    <div class="col-5 text-center">
      <select class="form-control form-control-sm" v-model="waypoint.action" @change="onChanged">
        <option key="nothing" value="nothing">{{formatAction(waypoint, 'nothing')}}</option>
        <option key="collectAll" value="collectAll">{{formatAction(waypoint, 'collectAll')}}</option>
        <option key="dropAll" value="dropAll">{{formatAction(waypoint, 'dropAll')}}</option>
        <option key="collect" value="collect">{{formatAction(waypoint, 'collect')}}</option>
        <option key="drop" value="drop">{{formatAction(waypoint, 'drop')}}</option>
        <option key="collectAllBut" value="collectAllBut">{{formatAction(waypoint, 'collectAllBut')}}</option>
        <option key="dropAllBut" value="dropAllBut">{{formatAction(waypoint, 'dropAllBut')}}</option>
        <option key="garrison" value="garrison">{{formatAction(waypoint, 'garrison')}}</option>
        <option key="collectPercentage" value="collectPercentage">{{formatAction(waypoint, 'collectPercentage')}}</option>
        <option key="dropPercentage" value="dropPercentage">{{formatAction(waypoint, 'dropPercentage')}}</option>
      </select>
    </div>
    <div class="col-2 text-center">
      <input v-if="isActionRequiresShips(waypoint.action)" class="form-control form-control-sm" type="number" v-model="waypoint.actionShips"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from "vuex";
import type {CarrierWaypoint} from "@solaris-common";
import {formatAction, isActionRequiresShips, isFirstWaypoint} from "@/util/waypoint";
import GameHelper from "@/services/gameHelper";
import type {Game} from "@/types/game";

const props = defineProps<{
  isInTransit: boolean,
  waypoint: CarrierWaypoint<string>,
  allWaypoints: CarrierWaypoint<string>[],
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

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

</style>
