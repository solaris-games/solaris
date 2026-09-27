<template>
  <tr v-if="waypoint">
    <td class="waypoint-element">
      <input
        type="number"
        class="form-control form-control-sm"
        v-if="!(isFirstWaypoint(allWaypoints, waypoint) && isInTransit)"
        v-model="waypoint.delayTicks"
        @change="onChanged"
      />
    </td>
    <td class="waypoint-element pt-2">
      <span>{{ getStarName(waypoint.destination) }}</span>
    </td>
    <td class="waypoint-element">
      <select
        class="form-select form-select-sm"
        v-model="waypoint.action"
        @change="onChanged"
      >
        <option key="nothing" value="nothing">
          {{ formatAction(waypoint, "nothing") }}
        </option>
        <option key="collectAll" value="collectAll">
          {{ formatAction(waypoint, "collectAll") }}
        </option>
        <option key="dropAll" value="dropAll">
          {{ formatAction(waypoint, "dropAll") }}
        </option>
        <option key="collect" value="collect">
          {{ formatAction(waypoint, "collect") }}
        </option>
        <option key="drop" value="drop">
          {{ formatAction(waypoint, "drop") }}
        </option>
        <option key="collectAllBut" value="collectAllBut">
          {{ formatAction(waypoint, "collectAllBut") }}
        </option>
        <option key="dropAllBut" value="dropAllBut">
          {{ formatAction(waypoint, "dropAllBut") }}
        </option>
        <option key="garrison" value="garrison">
          {{ formatAction(waypoint, "garrison") }}
        </option>
        <option key="collectPercentage" value="collectPercentage">
          {{ formatAction(waypoint, "collectPercentage") }}
        </option>
        <option key="dropPercentage" value="dropPercentage">
          {{ formatAction(waypoint, "dropPercentage") }}
        </option>
      </select>
    </td>
    <td class="waypoint-element">
      <input
        v-if="isActionRequiresShips(waypoint.action)"
        class="form-control form-control-sm"
        type="number"
        min="0"
        v-model="waypoint.actionShips"
      />
    </td>
  </tr>
</template>
<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import { computed, watch } from "vue";
import type { CarrierWaypoint, UserGameSettings } from "@solaris/common";
import {
  formatAction,
  isActionRequiresShips,
  isFirstWaypoint,
} from "@/util/waypoint";
import GameHelper from "@/services/gameHelper";
import type { Game } from "@/types/game";

const props = defineProps<{
  isInTransit: boolean;
  waypoint: CarrierWaypoint<string>;
  allWaypoints: CarrierWaypoint<string>[];
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const settings = computed<UserGameSettings>(() => store.settings!);

const onChanged = () => emit("onWaypointUpdated", props.waypoint);

const lastSeen = { waypoint: props.waypoint, action: props.waypoint.action };

watch(
  () => props.waypoint.action,
  (newAction) => {
    if (lastSeen.waypoint === props.waypoint) {
      const oldAction = lastSeen.action;

      if (
        !isActionRequiresShips(oldAction) &&
        isActionRequiresShips(newAction)
      ) {
        props.waypoint.actionShips = settings.value.carrier.defaultAmount;
      } else if (!isActionRequiresShips(newAction)) {
        props.waypoint.actionShips = 0;
      }
    }

    lastSeen.waypoint = props.waypoint;
    lastSeen.action = props.waypoint.action;
  },
);

const emit = defineEmits<{
  onWaypointUpdated: [waypoint: CarrierWaypoint<string>];
}>();

const getStarName = (starId: string) => {
  const star = GameHelper.getStarById(game.value, starId);
  return star ? star.name : "Unknown Star";
};
</script>
<style scoped>
.waypoint-element {
  text-align: center;
}
</style>
