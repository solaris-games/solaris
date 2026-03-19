<template>
  <div class="row">
    <div class="col-4 text-center pt-2 pb-1 ps-1 pe-1 card bg-dark">
        <h6>Economy</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-money-bill-wave text-success me-2"></i>{{ economy }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-money-bill-wave text-success me-2"></i>{{ economy }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
    <div class="col-4 text-center pt-2 pb-1 ps-1 pe-1 card">
        <h6>Industry</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-tools text-warning me-2"></i>{{ industry }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-tools text-warning me-2"></i>{{ industry }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
    <div class="col-4 text-center pt-2 pb-1 ps-1 pe-1 card bg-dark">
        <h6>Science</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-flask text-info me-2"></i>{{ science }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-flask text-info me-2"></i>{{ science }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper';
import type {Game} from "@/types/game.ts";

const props = defineProps<{
  playerId?: string,
  starId?: string,
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

const player = computed(() => props.playerId ? GameHelper.getPlayerById(game.value, props.playerId) : null);
const star = computed(() => props.starId ? GameHelper.getStarById(game.value, props.starId) : null);
const economy = computed(() => player.value ? player.value.stats!.totalEconomy : star.value!.infrastructure.economy || 0);
const industry = computed(() => player.value ? player.value.stats!.totalIndustry : star.value!.infrastructure.industry || 0);
const science = computed(() => player.value ? player.value.stats!.totalScience : star.value!.infrastructure.science || 0);
const isSmallHeaders = computed(() => economy.value >= 100 || industry.value >= 100 || science.value >= 100);
</script>

<style scoped>
.row {
  --bs-gutter-x: 0px;
}
</style>
