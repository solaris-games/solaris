<template>
<div class="table-responsive p-0">
    <table class="table table-striped table-hover mb-1">
        <thead class="table-dark">
            <tr>
                <td v-if="userPlayerOwnsCarrier">Delay</td>
                <td>Destination</td>
                <td v-if="!showAction" title="Show actions">
                  <a class="link-inactive" href="javascript:;" @click="toggleShowAction">
                    [&nbsp;ETA&nbsp;|&nbsp;<span class="link-active">Action</span>&nbsp;]
                  </a>
                </td>
                <td v-if="showAction" title="Show ETAs">
                  <a class="link-inactive" href="javascript:;" @click="toggleShowAction">
                    [&nbsp;<span class="link-active">ETA</span>&nbsp;|&nbsp;Action&nbsp;]
                  </a>
                </td>
                <td class="text-end" v-if="!isHistoricalMode && canEditWaypoints">
                  <a href="javascript:;" @click="onEditWaypointsRequested">
                    Edit
                  </a>
                </td>
            </tr>
        </thead>
        <tbody>
            <waypointRow v-for="waypoint in carrier.waypoints" v-bind:key="waypoint._id"
                        :carrier="carrier"
                        :waypoint="waypoint" :showAction="showAction"
                        @onEditWaypointRequested="onEditWaypointRequested"
                        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </tbody>
    </table>
</div>
</template>

<script setup lang="ts">
import WaypointRow from './WaypointRow.vue'
import GameHelper from '../../../../services/gameHelper'
import type {Carrier, Game} from "@/types/game";
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import type {CarrierWaypoint} from "@solaris-common";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const props = defineProps<{
  carrier: Carrier,
}>();

const emit = defineEmits<{
  onEditWaypointRequested: [waypoint: CarrierWaypoint<string>],
  onEditWaypointsRequested: [],
  onOpenStarDetailRequested: [starId: string],
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);
const isHistoricalMode = useIsHistoricalMode(store);

const showAction = ref(true);

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const userPlayerOwnsCarrier = computed(() => userPlayer.value && GameHelper.getCarrierOwningPlayer(game.value, props.carrier)!._id === userPlayer.value._id);
const canEditWaypoints = computed(() => !GameHelper.isGameFinished(game.value) && userPlayerOwnsCarrier.value && !props.carrier.isGift);

const toggleShowAction = () => showAction.value = !showAction.value;

const onEditWaypointRequested = (wp: CarrierWaypoint<string>) => emit('onEditWaypointRequested', wp);

const onEditWaypointsRequested = () => emit('onEditWaypointsRequested');

const onOpenStarDetailRequested = (starId: string) => emit('onOpenStarDetailRequested', starId);
</script>

<style scoped>
.link-inactive {
  text-decoration: none;
  color: inherit;
}

.link-active {
  text-decoration: underline;
  color: var(--bs-theme);
}
</style>
