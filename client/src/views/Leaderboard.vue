<template>
  <view-container>
    <view-title title="Leaderboards" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" href="#players">Players</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#guilds">Guilds</a>
      </li>
    </ul>

    <loading-spinner :loading="isLoading"/>

    <div class="tab-content pt-2" v-if="!isLoading">
      <div class="tab-pane fade show active" id="players">
        <div v-if="currentLeaderboard">
          <h4 class="mb-1">Top 100 Players</h4>
          <small class="text-warning">Total Players: {{totalPlayers}}</small>
          <leaderboard-user-table class="mt-2" :leaderboard="currentLeaderboard" :activeSortingKey="userSortingKey" @sortingRequested="switchToLeaderboard"></leaderboard-user-table>
        </div>
      </div>
      <div class="tab-pane fade" id="guilds">
        <div v-if="guildLeaderboard">
          <h4 class="mb-1">Top 10 Guilds</h4>
          <small class="text-warning">Total Guilds: {{totalGuilds}}</small>
          <sortable-leaderboard :leaderboard="guildLeaderboard" defaultSortingKey="rank" :header="GUILD_HEADERS">
            <template v-slot:header>
              <th>#</th>
              <th>Guild</th>
              <th class="text-right" title="Members"><i class="fas fa-user text-info"></i></th>
              <th class="text-right" title="Rank"><i class="fas fa-star text-info"></i></th>
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
    </div>

  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import UserApiService from '../services/api/user'
import GuildApiService from '../services/api/guild'
import LeaderboardUserTable from '../components/game/menu/LeaderboardUserTable'
import LeaderboardGuildTable from '../components/game/menu/LeaderboardGuildTable'
import SortableLeaderboard from '../components/game/menu/SortableLeaderboard'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'sortable-leaderboard': SortableLeaderboard,
    'leaderboard-user-table': LeaderboardUserTable,
    'leaderboard-guild-table': LeaderboardGuildTable
  },
  data () {
    return {
      isLoading: false,
      userLeaderboards: {},
      userSortingKey: 'rank',
      totalPlayers: 0,
      guildLeaderboard: null,
      totalGuilds: 0
    }
  },
  created () {
    this.GUILD_HEADERS = {
      position: "#",
      name: "Name",
      tag: "Tag",
      memberCount: <i class="fas fa-user text-info"></i>,
      rank: <i class="fas fa-star text-info"></i>
    }
  },
  async mounted () {
    this.isLoading = true
    this.guildLeaderboard = null

    try {
      let requests = [
        await UserApiService.getLeaderboard(100, this.userSortingKey),
        GuildApiService.getLeaderboard(100)
      ]

      let responses = await Promise.all(requests)
      
      if (responses[0].status === 200) {
        const result = responses[0].data
        this.userLeaderboards = result.leaderboard
        this.$set(this.userLeaderboards, this.userSortingKey, result.leaderboard)
        this.totalPlayers = result.totalPlayers
      }
      
      if (responses[1].status === 200) {
        this.guildLeaderboard = responses[1].data.leaderboard
        this.totalGuilds = responses[1].data.totalGuilds
      }
    } catch (err) {
      console.error(err)
    }

    this.isLoading = false
  },
  methods: {
    async switchToLeaderboard(sortingKey) {
      try {
        this.userSortingKey = sortingKey
        if (this.userLeaderboards[sortingKey]) {
          return
        }
        this.isLoading = true
        const result = await UserApiService.getLeaderboard(100, sortingKey)
        this.$set(this.userLeaderboards, sortingKey, result.data.leaderboard)
        this.isLoading = false
        this.totalPlayers = result.data.totalPlayers
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    currentLeaderboard () {
      return this.userLeaderboards[this.userSortingKey]
    }
  }
}
</script>

<style scoped>
</style>
