<template>
  <div class="tab-pane fade show active" id="players">
    <loading-spinner :loading="isLoading" />
    <h4 class="mb-1">Top {{ limit }} Players</h4>
    <small class="text-warning">Total Players: {{ totalPlayers }}</small>
    <div class="table-responsive">
      <sortable-leaderboard v-if="leaderboard && !isLoading" class="mt-2" :leaderboard="leaderboard"
        :sortingKey="sortingKey" @sortingRequested="sortLeaderboard">
        <template v-slot:header="actions">
          <th style="width: 5%">#</th>
          <th style="width: 25%">Player</th>
          <th style="width: 25%" class="d-none d-md-table-cell">Guild</th>
          <th style="width: 20%" class="text-end sortable-header col" :class="actions.getColumnClass('rank')"
            title="Total rank" @click="actions.sort('rank')">
            <i v-if="actions.isActive('rank')" class="fas fa-chevron-down"></i>
            <i class="fas fa-star text-info"></i>
          </th>
          <th style="width: 10%" class="text-end sortable-header col" :class="actions.getColumnClass('victories')"
            title="Total victories" @click="actions.sort('victories')">
            <i v-if="actions.isActive('victories')" class="fas fa-chevron-down"></i>
            <i class="fas fa-trophy text-warning"></i>
          </th>
          <th style="width: 10%" class="text-end sortable-header col" :class="actions.getColumnClass('renown')"
            title="Total renown" @click="actions.sort('renown')">
            <i v-if="actions.isActive('renown')" class="fas fa-chevron-down"></i>
            <i class="fas fa-heart text-danger"></i>
          </th>
        </template>
        <template v-slot:row="{ value: player, getColumnClass }">
          <tr :class="{ 'bg-primary': store.state.userId === player._id }">
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
            <td align="right" :class="getColumnClass('rank')">
              {{ player.achievements.rank }}
              <img class="user-level-icon" :src="getLevelSrc(player)" :alt="player.achievements.level">
            </td>
            <td align="right" :class="getColumnClass('victories')">{{ player.achievements.victories }}</td>
            <td align="right" :class="getColumnClass('renown')">{{ player.achievements.renown }}</td>
          </tr>
        </template>
      </sortable-leaderboard>
    </div>
  </div>
</template>

<script setup lang="ts">
import SortableLeaderboard from './SortableLeaderboard.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { computed, inject, onMounted, ref } from 'vue';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { getLeaderboard } from '@/services/typedapi/user';
import { useStore, type Store } from 'vuex';
import type { State } from '../../../../store';

const httpClient = inject(httpInjectionKey)!;
const store: Store<State> = useStore();

const props = defineProps<{
  limit: number,
}>();

const isLoading = ref(false);
const sortingKey = ref('rank');
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
};

const sortLeaderboard = async (key: string) => {
  sortingKey.value = key;
  await loadLeaderboard(key);
}

const getLevelSrc = (player) => {
  return new URL(`../../../../assets/levels/${player.achievements.level}.png`, import.meta.url).href
}

onMounted(async () => {
  await loadLeaderboard(sortingKey.value);
});
</script>

<style scoped>
.user-level-icon {
  height: 28px;
}
</style>
