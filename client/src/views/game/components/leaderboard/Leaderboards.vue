<template>
  <div v-if="isTeamConquest">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link" :class="{ 'active': activeTab === 'team' }" data-bs-toggle="tab" href="#team">Team</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ 'active': activeTab === 'player' }" data-bs-toggle="tab"
           href="#player">Player</a>
      </li>
    </ul>

    <div class="tab-content pt-2 pb-2">
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'team' }" id="team">
        <team-leaderboard @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
      </div>
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'player' }" id="player">
        <player-leaderboard @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
      </div>
    </div>
  </div>

  <player-leaderboard v-if="!isTeamConquest" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
</template>

<script setup lang="ts">
import TeamLeaderboard from "@/views/game/components/leaderboard/TeamLeaderboard.vue";
import PlayerLeaderboard from "@/views/game/components/leaderboard/PlayerLeaderboard.vue";
import { computed, ref } from "vue";

const props = defineProps<{
  isTeamConquest: boolean,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const activeTab = ref<'team' | 'player'>('team');

const onOpenPlayerDetailRequested = (playerId: string) => {
  emit('onOpenPlayerDetailRequested', playerId);
};
</script>

<style scoped>

</style>
