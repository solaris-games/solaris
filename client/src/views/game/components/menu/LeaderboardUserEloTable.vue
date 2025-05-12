<template>
  <div class="tab-pane fade show" id="elos">
    <loading-spinner :loading="isLoading" />
    <h4 class="mb-1">Top {{ limit }} Players by ELO</h4>
    <small class="text-warning">Improve your ELO by participating in 1v1's</small>
    <div class="table-responsive mt-2">
      <table class="table table-striped table-hover leaderboard-table">
        <thead class="table-dark">
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 25%">Player</th>
            <th style="width: 25%" class="d-none d-md-table-cell">Guild</th>
            <th style="width: 10%" class="text-end col">W/L</th>
            <th style="width: 10%" class="text-end col">ELO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player of leaderboard" :key="player._id" :class="{ 'bg-primary': store.state.userId === player._id }">
            <td>{{ player.position }}</td>
            <td>
              <router-link :to="{ name: 'account-achievements', params: { userId: player._id } }">
                <span>{{ player.username }}</span>
              </router-link>
              <i class="fas fa-hands-helping ms-1" title="This player is a contributor"
                v-if="player.roles && player.roles.contributor"></i>
              <i class="fas fa-code ms-1" title="This player is an active developer"
                v-if="player.roles && player.roles.developer"></i>
              <i class="fas fa-user-friends ms-1" title="This player is an active community manager"
                v-if="player.roles && player.roles.communityManager"></i>
              <i class="fas fa-dice ms-1" title="This player is an active game master"
                v-if="player.roles && player.roles.gameMaster"></i>
            </td>
            <td class="d-none d-md-table-cell">
              <router-link v-if="player.guild" :to="{ name: 'guild-details', params: { guildId: player.guild._id } }">
                <span>{{ player.guild.name }} [{{ player.guild.tag }}]</span>
              </router-link>
            </td>
            <td align="right">{{ player.achievements.victories1v1 }}/{{ player.achievements.defeated1v1 }}</td>
            <td align="right">{{ player.achievements.eloRating }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { computed, inject, onMounted, ref } from 'vue';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { getLeaderboard } from '@/services/typedapi/user';
import { useStore, type Store } from 'vuex';
import type { State } from '../../../../store';

const httpClient = inject(httpInjectionKey)!;
const store: Store<State> = useStore();

const props = defineProps<{
  limit: number
}>();

const isLoading = ref(false);
const sortingKey = ref('elo-rating');
const leaderboards = ref({});
const totalPlayers = ref(0);

const leaderboard = computed(() => leaderboards.value[sortingKey.value]);

const loadLeaderboard = async (key: string) => {
  if (leaderboards.value[key]) {
    return;
  }
  isLoading.value = true;

  const response = await getLeaderboard(httpClient)(props.limit, key);

  if (isOk(response)) {
    leaderboards.value[key] = response.data.leaderboard;
    totalPlayers.value = response.data.totalPlayers;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
}

onMounted(async () => {
  await loadLeaderboard(sortingKey.value);
});
</script>

<style scoped></style>
