<template>
<div class="tab-pane fade show active" id="players">
  <loading-spinner :loading="isLoading"/>
  <h4 class="mb-1">Top {{limit}} Players</h4>
  <small class="text-warning">Total Players: {{totalPlayers}}</small>
  <div class="table-responsive">
    <sortable-leaderboard v-if="leaderboard && !isLoading" class="mt-2" :leaderboard="leaderboard" :sortingKey="sortingKey" @sortingRequested="sortLeaderboard">
      <template v-slot:header="actions">
        <th style="width: 5%">#</th>
        <th style="width: 25%">Player</th>
        <th style="width: 25%" class="d-none d-md-table-cell">Guild</th>
        <th style="width: 20%" class="text-end sortable-header col" :class="actions.getColumnClass('rank')" title="Total rank" @click="actions.sort('rank')">
          <i v-if="actions.isActive('rank')" class="fas fa-chevron-down"></i>
          <i class="fas fa-star text-info"></i>
        </th>
        <th style="width: 10%" class="text-end sortable-header col" :class="actions.getColumnClass('victories')" title="Total victories" @click="actions.sort('victories')">
          <i v-if="actions.isActive('victories')" class="fas fa-chevron-down"></i>
          <i class="fas fa-trophy text-warning"></i>
        </th>
        <th style="width: 10%" class="text-end sortable-header col" :class="actions.getColumnClass('renown')" title="Total renown" @click="actions.sort('renown')">
          <i v-if="actions.isActive('renown')" class="fas fa-chevron-down"></i>
          <i class="fas fa-heart text-danger"></i>
        </th>
      </template>
      <template v-slot:row="{ value: player, getColumnClass }">
        <tr :class="{'bg-primary':$store.state.userId === player._id}">
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
          <td align="right" :class="getColumnClass('rank')">
            {{player.achievements.rank}}
            <img class="user-level-icon" :src="getLevelSrc(player)" :alt="player.achievements.level">
          </td>
          <td align="right" :class="getColumnClass('victories')">{{player.achievements.victories}}</td>
          <td align="right" :class="getColumnClass('renown')">{{player.achievements.renown}}</td>
        </tr>
      </template>
    </sortable-leaderboard>
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
      sortingKey: 'rank',
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
    },
    getLevelSrc (player) {
      return new URL(`../../../../assets/levels/${player.achievements.level}.png`, import.meta.url).href
    }
  },
  computed: {
    leaderboard () {
      return this.leaderboards[this.sortingKey];
    },
  },
}
</script>

<style scoped>
.user-level-icon {
  height: 28px;
}
</style>
