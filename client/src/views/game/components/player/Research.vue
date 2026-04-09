<template>
  <div class="row" v-if="player">
    <div class="col">
      <div class="table-responsive mb-0">
        <table class="table table-sm mb-0">
          <thead class="table-dark">
            <tr v-if="userPlayer && player != userPlayer">
              <th></th>
              <th></th>
              <th></th>
              <th class="text-end">You</th>
            </tr>
          </thead>
          <tbody>
            <research-row
              v-if="isTechnologyEnabled('scanning')"
              research="scanning"
              iconClass="fa-binoculars"
              title="Scanning"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('hyperspace')"
              research="hyperspace"
              iconClass="fa-gas-pump"
              title="Hyperspace Range"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('terraforming')"
              research="terraforming"
              iconClass="fa-globe-europe"
              title="Terraforming"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('experimentation')"
              research="experimentation"
              iconClass="fa-microscope"
              title="Experimentation"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('weapons')"
              research="weapons"
              iconClass="fa-gun"
              title="Weapons"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('banking')"
              research="banking"
              iconClass="fa-money-bill-alt"
              title="Banking"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('manufacturing')"
              research="manufacturing"
              iconClass="fa-industry"
              title="Manufacturing"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('specialists')"
              research="specialists"
              iconClass="fa-user-astronaut"
              title="Specialists"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';
import gameHelper from "../../../../services/gameHelper"
import TechnologyHelper from "../../../../services/technologyHelper"
import ResearchRow from "./ResearchRow.vue"
import type {Game} from "@/types/game.ts";
import GameHelper from "@/services/gameHelper.ts";
import type {ResearchTypeNotRandom} from "@solaris/common";

const props = defineProps<{
  playerId: string,
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

const isTechnologyEnabled = (technologyKey: ResearchTypeNotRandom) => TechnologyHelper.isTechnologyEnabled(game.value, technologyKey);
</script>

<style scoped>
.row-icon {
  width: 1%;
}
</style>
