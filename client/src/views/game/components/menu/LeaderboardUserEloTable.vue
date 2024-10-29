<template>
<div class="tab-pane fade show" id="elos">
  <loading-spinner :loading="isLoading"/>
  <h4 class="mb-1">Top {{limit}} Players by ELO</h4>
  <small class="text-warning">Improve your ELO by participating in 1v1's</small>
  <div class="table-responsive mt-2">
    <table class="table table-striped table-hover leaderboard-table">
      <thead class="table-dark">
        <th style="width: 5%">#</th>
        <th style="width: 25%">Player</th>
        <th style="width: 25%" class="d-none d-md-table-cell">Guild</th>
        <th style="width: 10%" class="text-end col">W/L</th>
        <th style="width: 10%" class="text-end col">ELO</th>
      </thead>
      <tbody>
        <tr v-for="player of leaderboard" :key="player._id" :class="{'bg-primary':$store.state.userId === player._id}">
          <td>{{player.position}}</td>
          <td>
              <router-link :to="{ name: 'account-achievements', params: { userId: player._id }}">
                  <span>{{player.username}}</span>
              </router-link>
              <i class="fas fa-hands-helping ms-1" title="This player is a contributor" v-if="player.roles && player.roles.contributor"></i>
              <i class="fas fa-code ms-1" title="This player is an active developer" v-if="player.roles && player.roles.developer"></i>
              <i class="fas fa-user-friends ms-1" title="This player is an active community manager" v-if="player.roles && player.roles.communityManager"></i>
              <i class="fas fa-dice ms-1" title="This player is an active game master" v-if="player.roles && player.roles.gameMaster"></i>
          </td>
          <td class="d-none d-md-table-cell">
            <router-link v-if="player.guild" :to="{ name: 'guild-details', params: { guildId: player.guild._id }}">
              <span>{{player.guild.name}} [{{player.guild.tag}}]</span>
            </router-link>
          </td>
          <td align="right">{{player.achievements.victories1v1}}/{{player.achievements.defeated1v1}}</td>
          <td align="right">{{player.achievements.eloRating}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import SortableLeaderboard from './SortableLeaderboard.vue';
import UserApiService from '../../../../services/api/user';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

export default {
  components: {
    'sortable-leaderboard': SortableLeaderboard,
    'loading-spinner': LoadingSpinner
  },
  props: {
    limit: Number
  },
  data () {
    return {
      isLoading: false,
      sortingKey: 'elo-rating',
      leaderboards: {},
      totalPlayers: 0
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
        const response = await UserApiService.getLeaderboard(this.limit, key, 0);
        if (response.status === 200) {
          this.leaderboards[key] = response.data.leaderboard;
          this.totalPlayers = response.data.totalPlayers;
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
