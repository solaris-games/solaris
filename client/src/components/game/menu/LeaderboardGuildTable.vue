<template>
  <div class="tab-pane fade" id="guilds">
    <loading-spinner :loading="isLoading"/>
    <div id="guilds" >

      <h4 class="mb-1">Top 100 Guilds</h4>
      <small class="text-warning">Total Guilds: {{totalGuilds}}</small>

      <sortable-leaderboard v-if="leaderboard && !isLoading" class="mt-2" :leaderboard="leaderboard" :sortingKey="sortingKey" @sortingRequested="sortLeaderboard">
        <template v-slot:header="actions">
          <th style="width: 10%">#</th>
          <th style="width: 50%">Guild</th>
          <th style="width: 20%" class="text-right" title="Members" @click="actions.sort('memberCount')" :class="actions.getColumnClass('memberCount')">
            <i class="fas fa-user text-info"></i>
            <i v-if="actions.isActive('memberCount')" class="fas fa-chevron-down ml-2"></i>
          </th>
          <th style="width: 20%" class="text-right" title="Rank" @click="actions.sort('totalRank')" :class="actions.getColumnClass('totalRank')">
            <i class="fas fa-star text-info"></i>
            <i v-if="actions.isActive('totalRank')" class="fas fa-chevron-down ml-2"></i>
          </th>
        </template>
        <template v-slot:row="guild">
            <td>{{guild.position}}</td>
            <td>
                {{guild.name}} [{{guild.tag}}]
            </td>
            <td align="right">{{guild.memberCount}}</td>
            <td align="right">{{guild.totalRank}}</td>
        </template>
      </sortable-leaderboard>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '../../LoadingSpinner';
import SortableLeaderboard from './SortableLeaderboard';
import GuildApiService from '../../../services/api/guild';

export default {
  components: {
    'loading-spinner': LoadingSpinner,
    'sortable-leaderboard': SortableLeaderboard
  },
  data () {
    return {
      leaderboard: [],
      isLoading: false,
      sortingKey: 'totalRank',
      totalGuilds: 0
    }
  },
  async mounted () {
    this.loading = true;
    try {
      const response = await GuildApiService.getLeaderboard(100, this.sortingKey);
      if (response.status === 200) {
        this.leaderboard = response.data.leaderboard;
        this.totalGuilds = response.data.totalGuilds;
      }
    } catch (err) {
      console.error(err);
    }

    this.loading = false;
  },
  methods: {
    async sortLeaderboard (key) {
      this.isLoading = true;
      this.sortingKey = key;
      const response = await GuildApiService.getLeaderboard(100, this.sortingKey);
      if (response.status === 200) {
        this.leaderboard = response.data.leaderboard;
        this.totalGuilds = response.data.totalGuilds;
      }
      this.isLoading = false;
    }
  }
}
</script>

<style scoped>
</style>
