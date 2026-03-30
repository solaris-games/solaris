<template>
  <div class="row" v-if="comparePlayer?.stats && userPlayer?.stats">
    <div class="col pt-2 pb-2">
        <span>Yours</span>
        <span class="float-end">
          <i class="fas fa-chevron-up me-1 text-success" v-if="comparePlayer.stats.totalEconomy < userPlayer.stats.totalEconomy"></i>
          <i class="fas fa-chevron-down me-1 text-danger" v-if="comparePlayer.stats.totalEconomy > userPlayer.stats.totalEconomy"></i>
          <span>{{userPlayer.stats.totalEconomy}}</span>
        </span>
    </div>
    <div class="col bg-dark pt-2 pb-2">
        <span>Yours</span>
        <span class="float-end">
          <i class="fas fa-chevron-up me-1 text-success" v-if="comparePlayer.stats.totalIndustry < userPlayer.stats.totalIndustry"></i>
          <i class="fas fa-chevron-down me-1 text-danger" v-if="comparePlayer.stats.totalIndustry > userPlayer.stats.totalIndustry"></i>
          <span>{{userPlayer.stats.totalIndustry}}</span>
        </span>
    </div>
    <div class="col pt-2 pb-2">
        <span>Yours</span>
        <span class="float-end">
          <i class="fas fa-chevron-up me-1 text-success" v-if="comparePlayer.stats.totalScience < userPlayer.stats.totalScience"></i>
          <i class="fas fa-chevron-down me-1 text-danger" v-if="comparePlayer.stats.totalScience > userPlayer.stats.totalScience"></i>
          <span>{{userPlayer.stats.totalScience}}</span>
        </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import GameHelper from '../../../../services/gameHelper';

const props = defineProps<{
    comparePlayerId: string;
}>();

const store = useGameStore();

const userPlayer = computed(() => {
    return GameHelper.getUserPlayer(store.game);
});

const comparePlayer = computed(() => {
    return GameHelper.getPlayerById(store.game, props.comparePlayerId);
});
</script>

<style scoped>
</style>
