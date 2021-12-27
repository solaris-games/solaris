<template>
  <view-container>
    <view-title title="Administration" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" href="#games">Games</a>
      </li>
      <li class="nav-item" v-if="isAdministrator">
          <a class="nav-link" data-toggle="tab" href="#users">Users</a>
      </li>
    </ul>

    <loading-spinner :loading="isLoading"/>

    <div class="tab-content pt-2" v-if="!isLoading">
      <div class="tab-pane fade show active" id="games">
        <div v-if="games">
          <h4 class="mb-1">Recent Games</h4>
          <!-- <p><small class="text-warning">Total Games: {{games.length}}</small></p>
          <p><small class="text-warning">Total Started: {{games.filter(x => x.state.startDate).length}}</small></p>
          <p><small class="text-warning">Total Completed: {{games.filter(x => x.state.endDate).length}}</small></p> -->
          <table class="mt-2 table table-sm table-striped table-responsive">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Players</th>
                <th>Settings</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Tick</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game of games" :key="game._id">
                <td>
                  {{game.settings.general.name}}
                </td>
                <td>
                  {{game.settings.general.type}}
                </td>
                <td>
                  {{game.state.players}}/{{game.settings.general.playerLimit}}
                </td>
                <td>
                  <i class="clickable fas" :class="{'fa-star text-success':game.settings.general.featured,'fa-star text-danger':!game.settings.general.featured}"
                    @click="toggleFeaturedGame(game)" title="Featured"></i>
                  <i class="clickable ml-1 fas" :class="{'fa-clock text-success':game.settings.general.timeMachine === 'enabled','fa-clock text-danger':game.settings.general.timeMachine === 'disabled'}"
                    @click="toggleTimeMachineGame(game)" v-if="isAdministrator" title="Time Machine"></i>
                </td>
                <td><i class="fas" :class="{'fa-check text-success':game.state.startDate,'fa-times text-danger':!game.state.startDate}" :title="game.state.startDate"></i></td>
                <td><i class="fas" :class="{'fa-check text-success':game.state.endDate,'fa-times text-danger':!game.state.endDate}" :title="game.state.endDate"></i></td>
                <td :class="{'text-warning':gameNeedsAttention(game)}">{{game.state.tick}}</td>
                <td>
                  <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-success">View</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="tab-pane fade" id="users" v-if="isAdministrator">
        <div v-if="users">
          <h4 class="mb-1">Recent Users</h4>
          <!-- <small class="text-warning">Total Users: {{users.length}}</small> -->
          <table class="mt-2 table table-sm table-striped table-responsive">
            <thead>
              <tr>
                <th>Username</th>
                <th>Last Seen</th>
                <th>Roles</th>
                <th>Credits</th>
                <th>Email</th>
                <th>EP</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user of users" :key="user._id">
                <td :title="user.email">{{user.username}}</td>
                <td :title="getDuplicateIPs(user)" :class="{'text-warning':getDuplicateIPs(user).length}">{{getLastSeenString(user.lastSeen)}}</td>
                <td>
                  <i class="fas fa-hands-helping clickable" :class="{'disabled-role':!user.roles.contributor}" @click="toggleRole(user, 'contributor')" title="Toggle Contributor Role"></i>
                  <i class="fas fa-code ml-1 clickable" :class="{'disabled-role':!user.roles.developer}" @click="toggleRole(user, 'developer')" title="Toggle Developer Role"></i>
                  <i class="fas fa-user-friends ml-1 clickable" :class="{'disabled-role':!user.roles.communityManager}" @click="toggleRole(user, 'communityManager')" title="Toggle Community Manager Role"></i>
                  <i class="fas fa-dice ml-1 clickable" :class="{'disabled-role':!user.roles.gameMaster}" @click="toggleRole(user, 'gameMaster')" title="Toggle Game Master Role"></i>
                </td>
                <td>
                  <i class="fas fa-minus clickable text-danger" @click="setCredits(user, user.credits - 1)" title="Deduct Credits"></i>
                  {{user.credits}}
                  <i class="fas fa-plus clickable text-success" @click="setCredits(user, user.credits + 1)" title="Add Credits"></i>
                </td>
                <td><i class="fas" :class="{'fa-check':user.emailEnabled,'fa-times text-danger':!user.emailEnabled}"></i></td>
                <td><i class="fas clickable" :class="{'fa-check':user.isEstablishedPlayer,'fa-times text-danger': !user.isEstablishedPlayer}" @click="promoteToEstablishedPlayer(user)"></i></td>
                <td>
                  <a v-if="user.resetPasswordToken" :href="'#/account/reset-password-external?token=' + user.resetPasswordToken">PW Reset</a>
                </td>
                <td>
                  <i class="fas fa-hammer clickable text-danger" :class="{'disabled-role':!user.banned}" @click="toggleBan(user)" title="Toggle Banned"></i>
                  <i class="fas fa-user clickable text-info ml-1" @click="impersonate(user)" title="Impersonate User"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import AdminApiService from '../services/api/admin'
import router from '../router'
import moment from 'moment'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner
  },
  data () {
    return {
      isLoading: false,
      users: null,
      games: null
    }
  },
  async mounted () {
    this.isLoading = true
    this.users = null
    this.games = null

    try {
      let requests = [
        AdminApiService.getGames()
      ]

      if (this.isAdministrator) {
        requests.push(AdminApiService.getUsers())
      }

      let responses = await Promise.all(requests)
      
      if (responses[0].status === 200) {
        this.games = responses[0].data
      }
      
      if (responses[1] && responses[1].status === 200) {
        this.users = responses[1].data
      }
    } catch (err) {
      console.error(err)
    }

    this.isLoading = false
  },
  methods: {
    getLastSeenString (lastSeen) {
      if (!lastSeen) {
        return ''
      }

      return moment(lastSeen).utc().fromNow()
    },
    getDuplicateIPs (user) {
      return this.users.filter(x => x._id !== user._id && x.lastSeenIP && x.lastSeenIP === user.lastSeenIP).map(x => x.username)
    },
    async toggleRole (user, role) {
      try {
        user.roles[role] = !user.roles[role]

        let request;

        switch (role) {
          case 'contributor':
            request = AdminApiService.setRoleContributor(user._id, user.roles.contributor)
            break
          case 'developer':
            request = AdminApiService.setRoleDeveloper(user._id, user.roles.developer)
            break
          case 'communityManager':
            request = AdminApiService.setRoleCommunityManager(user._id, user.roles.communityManager)
            break
          case 'gameMaster':
            request = AdminApiService.setRoleGameMaster(user._id, user.roles.gameMaster)
            break
        }

        await request
      } catch (err) {
        console.error(err)
      }
    },
    async setCredits (user, credits) {
      try {
        user.credits = Math.max(credits, 0)

        await AdminApiService.setCredits(user._id, credits)
      } catch (err) {
        console.error(err)
      }
    },
    async toggleBan (user) {
      if (!await this.$confirm('Ban/Unban', 'Are you sure you want to ban/unban this player?')) {
        return
      }

      try {
        user.banned = !user.banned

        if (user.banned) {
          await AdminApiService.ban(user._id)
        } else {
          await AdminApiService.unban(user._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async promoteToEstablishedPlayer (user) {
      if (user.isEstablishedPlayer) {
        return
      }

      try {
        user.isEstablishedPlayer = true

        await AdminApiService.promoteToEstablishedPlayer(user._id)
      } catch (err) {
        console.error(err)
      }
    },
    async impersonate (user) {
      try {
        await AdminApiService.impersonate(user._id, user.username, user.roles)
        
        this.$store.commit('setUserId', user._id)
        this.$store.commit('setUsername', user.username)
        this.$store.commit('setRoles', user.roles)

        router.push({ name: 'home' })
      } catch (err) {
        console.error(err)
      }
    },
    async toggleFeaturedGame (game) {
      try {
        game.settings.general.featured = !game.settings.general.featured

        await AdminApiService.setGameFeatured(game._id, game.settings.general.featured)
      } catch (err) {
        console.error(err)
      }
    },
    async toggleTimeMachineGame (game) {
      try {
        if (game.settings.general.timeMachine === 'enabled') {
          game.settings.general.timeMachine = 'disabled'
        } else {
          game.settings.general.timeMachine = 'enabled'
        }

        await AdminApiService.setGameTimeMachine(game._id, game.settings.general.timeMachine)
      } catch (err) {
        console.error(err)
      }
    },
    gameNeedsAttention (game) {
      return game.state.endDate && game.state.tick <= 12
    }
  },
  computed: {
    isAdministrator () {
      return this.$store.state.roles.administrator
    }
  }
}
</script>

<style scoped>
.disabled-role {
  opacity: 0.2
}

.clickable {
  cursor: pointer;
}
</style>
