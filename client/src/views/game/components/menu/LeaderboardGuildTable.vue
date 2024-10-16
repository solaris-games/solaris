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

<script>
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import SortableLeaderboard from './SortableLeaderboard.vue';
import GuildApiService from '../../../../services/api/guild';

export default {
  components: {
    'loading-spinner': LoadingSpinner,
    'sortable-leaderboard': SortableLeaderboard
  },
  data () {
    return {
      leaderboards: {},
      isLoading: true,
      sortingKey: 'totalRank',
      totalGuilds: 0
    }
  },
  async mounted () {
    await this.loadLeaderboard(this.sortingKey);
  },
  methods: {
    async sortLeaderboard (key) {
      this.sortingKey = key;
      await this.loadLeaderboard(key);
    },
    async loadLeaderboard (key) {
      if (this.leaderboards[key]) {
        return;
      }
      this.isLoading = true;
      try {
        const response = await GuildApiService.getLeaderboard(100, key);
        if (response.status === 200) {
          this.leaderboards[key] = response.data.leaderboard;
          this.totalGuilds = response.data.totalGuilds;
        }
      } catch (err) {
        console.error(err);
      }
      this.isLoading = false;
    }
  },
  computed: {
    leaderboard () {
      return this.leaderboards[this.sortingKey];
    }
  }
}
</script>

<style scoped>
</style>
