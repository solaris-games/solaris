<template>
  <view-container>
    <view-title title="Join Game" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" href="#newGames">New Games</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#inProgressGames">In Progress</a>
      </li>
    </ul>

    <div class="tab-content pt-2">
        <div class="tab-pane fade show active" id="newGames">
          <h4>Official Games</h4>

          <p>These are official games and have standard settings.</p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !serverGames.length" class="text-danger mb-2">
            There are no official games available.
          </p>

          <table v-if="!isLoading && serverGames.length" class="table table-striped table-hover">
              <thead>
                  <tr class="bg-primary">
                      <td>Name</td>
                      <td>Type</td>
                      <td class="d-none d-md-block text-center">Players</td>
                      <td></td>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in serverGames" v-bind:key="game._id">
                      <td>{{game.settings.general.name}}</td>
                      <td>{{game.settings.general.description}}</td>
                      <td class="d-none d-md-block text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                      <td>
                          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-success float-right">
                            <span class="d-none d-md-block">View</span>
                            <span class="d-xs-block d-sm-block d-md-none">
                              {{game.state.players}}/{{game.settings.general.playerLimit}}
                            </span>
                          </router-link>
                      </td>
                  </tr>
              </tbody>
          </table>

          <div class="text-right" v-if="!isLoading">
            <router-link to="/game/active-games" tag="button" class="btn btn-success">View My Games</router-link>
          </div>

          <hr>

          <h4>User Created Games</h4>

          <loading-spinner :loading="isLoading"/>

          <div v-if="!isLoading && !userGames.length" class="text-warning mb-2">
            There are no user created games available.
          </div>

          <table v-if="!isLoading && userGames.length" class="table table-striped table-hover">
              <thead>
                  <tr class="bg-primary">
                      <td>Name</td>
                      <td class="d-none d-md-block text-center">Players</td>
                      <td></td>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in userGames" v-bind:key="game._id">
                      <td>{{game.settings.general.name}}</td>
                      <td class="d-none d-md-block text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                      <td>
                          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-success float-right">
                            <span class="d-none d-md-block">View</span>
                            <span class="d-xs-block d-sm-block d-md-none">
                              {{game.state.players}}/{{game.settings.general.playerLimit}}
                            </span>
                          </router-link>
                      </td>
                  </tr>
              </tbody>
          </table>

          <div class="text-right" v-if="!isLoading">
            <router-link to="/game/create" tag="button" class="btn btn-info">Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ml-1">View My Games</router-link>
          </div>
        </div>
        <div class="tab-pane fade" id="inProgressGames">
          <h4>In Progress Games</h4>

          <p>These games are in progress, you can join games with open slots.</p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !inProgressGames.length" class="text-danger mb-2">
            There are no games currently in progress.
          </p>

          <table v-if="!isLoading && inProgressGames.length" class="table table-striped table-hover">
              <thead>
                  <tr class="bg-primary">
                      <td>Name</td>
                      <td class="d-none d-md-block text-center">Players</td>
                      <td></td>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in inProgressGames" v-bind:key="game._id">
                      <td>{{game.settings.general.name}}</td>
                      <td class="d-none d-md-block text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                      <td>
                          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-success float-right">
                            <span class="d-none d-md-block">View</span>
                            <span class="d-xs-block d-sm-block d-md-none">
                              {{game.state.players}}/{{game.settings.general.playerLimit}}
                            </span>
                          </router-link>
                      </td>
                  </tr>
              </tbody>
          </table>

          <div class="text-right" v-if="!isLoading">
            <router-link to="/game/active-games" tag="button" class="btn btn-success">View My Games</router-link>
          </div>
        </div>
    </div>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewTitle from '../components/ViewTitle'
import ViewContainer from '../components/ViewContainer'
import gameService from '../services/api/game'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle
  },
  data () {
    return {
      serverGames: [],
      userGames: [],
      inProgressGames: [],
      isLoading: true
    }
  },
  async mounted () {
    this.isLoading = true

    try {
      let requests = [
        gameService.listOfficialGames(),
        gameService.listUserGames(),
        gameService.listInProgressGames()
      ]

      let responses = await Promise.all(requests)

      this.serverGames = responses[0].data
      this.userGames = responses[1].data
      this.inProgressGames = responses[2].data
    } catch (err) {
      console.error(err)
    }

    this.isLoading = false
  }
}
</script>

<style scoped>
</style>
