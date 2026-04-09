<template>
  <div class="tab-pane fade" id="guilds">
    <loading-spinner :loading="isLoading"/>
    <h4 class="mb-1">Top 100 Guilds</h4>
    <small class="text-warning">Total Guilds: {{totalGuilds}}</small>

    <sortable-leaderboard v-if="leaderboard && !isLoading" class="mt-2" :leaderboard="leaderboard" :sortingKey="sortingKey" @sortingRequested="sortLeaderboard">
      <template v-slot:header="actions">
        <th style="width: 10%">#</th>
        <th style="width: 50%">Guild</th>
        <th style="width: 20%" class="text-end sortable-header" title="Members" @click="actions.sort('memberCount')" :class="actions.getColumnClass('memberCount')">
          <i v-if="actions.isActive('memberCount')" class="fas fa-chevron-down"></i>
          <i class="fas fa-user"></i>
        </th>
        <th style="width: 20%" class="text-end sortable-header" title="Rank" @click="actions.sort('totalRank')" :class="actions.getColumnClass('totalRank')">
          <i v-if="actions.isActive('totalRank')" class="fas fa-chevron-down"></i>
          <i class="fas fa-star text-info"></i>
        </th>
      </template>
      <template v-slot:row="{ value, getColumnClass }">
        <tr>
          <td>{{value.position}}</td>
          <td>
            <router-link :to="{ name: 'guild-details', params: { guildId: value._id }}">
              <span>{{value.name}} [{{value.tag}}]</span>
            </router-link>
          </td>
          <td :class="getColumnClass('memberCount')" align="right">{{value.memberCount}}</td>
          <td :class="getColumnClass('totalRank')" align="right">{{value.totalRank}}</td>
        </tr>
      </template>
    </sortable-leaderboard>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, type Ref, onMounted } from "vue";
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import SortableLeaderboard from './SortableLeaderboard.vue';
import type {GuildLeaderboard, GuildSortingKey} from "@solaris/common";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {listGuildLeaderboard} from "@/services/typedapi/guild";

const httpClient = inject(httpInjectionKey)!;

const isLoading = ref(true);
const leaderboards: Ref<Partial<Record<GuildSortingKey, GuildLeaderboard<string>[]>>> = ref({});
const sortingKey = ref<GuildSortingKey>('totalRank');
const totalGuilds = ref(0);

const leaderboard = computed(() => leaderboards.value[sortingKey.value]);

const loadLeaderboard = async (key: GuildSortingKey) => {
  if (leaderboards.value[key]) {
    return;
  }

  isLoading.value = true;

  const response = await listGuildLeaderboard(httpClient)(key, 100);
  if (isOk(response)) {
    leaderboards.value[key] = response.data.leaderboard;
    totalGuilds.value = response.data.totalGuilds;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const sortLeaderboard = (key: GuildSortingKey) => {
  sortingKey.value = key;
  loadLeaderboard(key);
};

onMounted(() => {
  loadLeaderboard(sortingKey.value);
});
</script>

<style scoped>
</style>
