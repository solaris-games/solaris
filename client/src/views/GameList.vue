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
          <h4 v-if="games.featured">Featured Game</h4>

          <div class="row no-gutters" v-if="!isLoading">
            <!-- Featured -->
            <div class="col-sm-12 col-md-12 col-lg-12 mb-0" v-if="games.featured">
              <div class="card featured-card bg-dark text-white" @click="routeToPath('/game/detail', { id: games.featured._id })">
                <img class="card-img" :src="require('../assets/screenshots/featured.png')" alt="Featured Game">
                <div class="card-img-overlay">
                  <h4 class="card-title featured-card-title">
                    <i class="fas fa-star"></i>
                    <span class="ml-0">
                      {{games.featured.settings.general.name}}
                    </span>
                  </h4>
                  <h6 class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.featured)}}
                    ({{games.featured.state.players}}/{{games.featured.settings.general.playerLimit}})
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <hr v-if="games.featured"/>

          <h4>Standard Games</h4>

          <p>These are official games and award rank.</p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !serverGames.length" class="text-danger mb-2">
            There are no official games available.
          </p>
          
          <div class="row no-gutters" v-if="!isLoading">
            <!-- New Player -->
            <div class="col-sm-12 col-md-4 col-lg-4 pr-1" v-if="games.newPlayerRT">
              <div class="card bg-dark text-white new-player-game" @click="routeToPath('/game/detail', { id: games.newPlayerRT._id })">
                <img class="card-img" :src="require('../assets/screenshots/new_player_rt.png')" alt="View New Player Game">
                <div class="card-img-overlay">
                  <h5 class="card-title new-player-card-title">
                    <i class="fas fa-user-graduate"></i>
                    <span class="ml-2">{{getGameTypeFriendlyText(games.newPlayerRT)}}</span>
                  </h5>
                  <h6 class="card-title card-subtitle new-player-card-subtitle">
                    {{games.newPlayerRT.settings.general.name}}
                    ({{games.newPlayerRT.state.players}}/{{games.newPlayerRT.settings.general.playerLimit}})
                  </h6>
                </div>
              </div>
            </div>

            <!-- Special Game -->
            <div class="col-sm-12 col-md-8 col-lg-8 pl-1" v-if="games.special">
              <div class="card bg-dark text-white special-game" @click="routeToPath('/game/detail', { id: games.special._id })">
                <img class="card-img" :src="require('../assets/screenshots/' + games.special.settings.general.type + '.png')" alt="Special Game">
                <div class="card-img-overlay">
                  <h5 class="card-title special-card-title">
                    <i class="fas" :class="{
                      'fa-moon': games.special.settings.general.type === 'special_dark',
                      'fa-moon': games.special.settings.general.type === 'special_ultraDark',
                      'fa-drumstick-bite': games.special.settings.general.type === 'special_battleRoyale',
                      'fa-satellite': games.special.settings.general.type === 'special_orbital',
                      'fa-home': games.special.settings.general.type === 'special_homeStar',
                      'fa-user-secret': games.special.settings.general.type === 'special_anonymous',
                    }"></i>
                    <span class="ml-2">{{games.special.settings.general.name}}</span>
                  </h5>
                  <h6 class="card-title card-subtitle special-card-subtitle">
                    {{getGameTypeFriendlyText(games.special)}}
                    ({{games.special.state.players}}/{{games.special.settings.general.playerLimit}}) -
                    <strong>x2 Rank</strong>
                  </h6>
                </div>
              </div>
            </div>

            <!-- Standard -->
            <div class="col-sm-12 col-md-3 col-lg-3 pr-1" v-if="games.standardRT">
              <div class="card bg-dark text-white standard-game" @click="routeToPath('/game/detail', { id: games.standardRT._id })">
                <img class="card-img" :src="require('../assets/screenshots/standard_rt.png')" alt="Standard Game">
                <div class="card-img-overlay">
                  <h6 class="card-title standard-card-title">
                    <i class="fas fa-user-astronaut"></i>
                    <span class="ml-2">{{games.standardRT.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle standard-card-subtitle">
                    {{getGameTypeFriendlyText(games.standardRT)}}
                    ({{games.standardRT.state.players}}/{{games.standardRT.settings.general.playerLimit}})
                  </p>
                </div>
              </div>
            </div>

            <!-- Standard TB -->
            <div class="col-sm-12 col-md-3 col-lg-3 pr-1 pl-1" v-if="games.standardTB">
              <div class="card bg-dark text-white" @click="routeToPath('/game/detail', { id: games.standardTB._id })">
                <img class="card-img" :src="require('../assets/screenshots/standard_tb.png')" alt="Standard Turn Based Game">
                <div class="card-img-overlay">
                  <h6 class="card-title">
                    <i class="fas fa-user-astronaut"></i>
                    <span class="ml-2">{{games.standardTB.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.standardTB)}}
                    ({{games.standardTB.state.players}}/{{games.standardTB.settings.general.playerLimit}})
                  </p>
                </div>
              </div>
            </div>

            <!-- 1v1 -->
            <div class="col-sm-12 col-md-3 col-lg-3 pr-1 pl-1" v-if="games.oneVsOneRT">
              <div class="card bg-dark text-white" @click="routeToPath('/game/detail', { id: games.oneVsOneRT._id })">
                <img class="card-img" :src="require('../assets/screenshots/1v1_rt.png')" alt="1 vs. 1 Game">
                <div class="card-img-overlay">
                  <h6 class="card-title">
                    <i class="fas fa-user-friends"></i>
                    <span class="ml-2">{{games.oneVsOneRT.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.oneVsOneRT)}}
                    ({{games.oneVsOneRT.state.players}}/{{games.oneVsOneRT.settings.general.playerLimit}})
                  </p>
                </div>
              </div>
            </div>

            <!-- 1v1 TB -->
            <div class="col-sm-12 col-md-3 col-lg-3 pl-1" v-if="games.oneVsOneTB">
              <div class="card bg-dark text-white" @click="routeToPath('/game/detail', { id: games.oneVsOneTB._id })">
                <img class="card-img" :src="require('../assets/screenshots/1v1_tb.png')" alt="1 vs. 1 Turn Based Game">
                <div class="card-img-overlay">
                  <h6 class="card-title">
                    <i class="fas fa-user-friends"></i>
                    <span class="ml-2">{{games.oneVsOneTB.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.oneVsOneTB)}}
                    ({{games.oneVsOneTB.state.players}}/{{games.oneVsOneTB.settings.general.playerLimit}})
                  </p>
                </div>
              </div>
            </div>

            <!-- 32 Player -->
            <div class="col-sm-12 col-md-12 col-lg-12" v-if="games.thirtyTwoPlayerRT">
              <div class="card bg-dark text-white" @click="routeToPath('/game/detail', { id: games.thirtyTwoPlayerRT._id })">
                <img class="card-img" :src="require('../assets/screenshots/32_player.png')" alt="32 Player Game">
                <div class="card-img-overlay">
                  <h5 class="card-title">
                    <i class="fas fa-users"></i>
                    <span class="ml-2">{{games.thirtyTwoPlayerRT.settings.general.name}}</span>
                  </h5>
                  <h6 class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.thirtyTwoPlayerRT)}}
                    ({{games.thirtyTwoPlayerRT.state.players}}/{{games.thirtyTwoPlayerRT.settings.general.playerLimit}})
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <div class="text-right" v-if="!isLoading">
            <router-link to="/game/create" tag="button" class="btn btn-info mr-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ml-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>

          <hr/>

          <!-- TODO: Turn this into a component and put it on the main menu as well -->
          <div class="row no-gutters">
            <div class="col-sm-12 col-md-6 col-lg-6 pr-2">
              <div class="card bg-dark text-white tutorial-game" @click="viewTutorial()">
                <img class="card-img" :src="require('../assets/screenshots/new_player_rt.png')" alt="View Tutorial">
                <div class="card-img-overlay">
                  <h5 class="card-title tutorial-card-title">
                    <i class="fas fa-user-graduate"></i>
                    <span class="ml-2">Tutorial</span>
                  </h5>
                  <h6 class="card-title card-subtitle">
                    Learn to Play
                  </h6>
                </div>
              </div>
            </div>
            <div class="col-sm-12 col-md-6 col-lg-6 pl-2">
              <h5>Tutorial Game</h5>
              <p>
                New to <span class="text-info">Solaris</span>? Learn the basics by completing the tutorial and when you're ready, join a standard game to fight against real players.
              </p>
            </div>
          </div>

          <hr/>

          <h4 class="mb-0">User Created Games</h4>

          <p class="mb-2"><small class="text-warning" v-if="userGames.length">Total Games: {{userGames.length}}</small></p>

          <loading-spinner :loading="isLoading"/>

          <div v-if="!isLoading && !userGames.length" class="text-warning mb-2">
            There are no user created games available.
          </div>

          <table v-if="!isLoading && userGames.length" class="table table-striped table-hover">
              <thead>
                  <tr class="bg-primary">
                      <td>Name</td>
                      <td class="d-none d-md-table-cell text-center">Players</td>
                      <td></td>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in userGames" v-bind:key="game._id">
                      <td>{{game.settings.general.name}}</td>
                      <td class="d-none d-md-table-cell text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
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
            <router-link to="/game/create" tag="button" class="btn btn-info mr-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ml-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>
        </div>
        
        <div class="tab-pane fade" id="inProgressGames">
          <h4>In Progress Games</h4>

          <p class="mb-1">These games are in progress, you can join games with open slots. <b>Fill slots to earn additional rank!</b></p>

          <p class="mb-2"><small class="text-warning" v-if="inProgressGames.length">Total Games: {{inProgressGames.length}}</small></p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !inProgressGames.length" class="text-danger mb-2">
            There are no games currently in progress.
          </p>

          <table v-if="!isLoading && inProgressGames.length" class="table table-striped table-hover">
              <thead>
                  <tr class="bg-primary">
                      <th>Name</th>
                      <th class="d-none d-md-table-cell text-center">Players</th>
                      <th></th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in inProgressGames" v-bind:key="game._id">
                      <td>
                        <router-link :to="{ path: '/game/detail', query: { id: game._id } }">{{game.settings.general.name}}</router-link>
                        <br/>
                        <small>{{getGameTypeFriendlyText(game)}}</small>
                      </td>
                      <td class="d-none d-md-table-cell text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
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
            <router-link to="/game/create" tag="button" class="btn btn-info mr-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ml-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>
        </div>
    </div>
  </view-container>
</template>

<script>
import router from '../router'
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewTitle from '../components/ViewTitle'
import ViewContainer from '../components/ViewContainer'
import gameService from '../services/api/game'
import GameHelper from '../services/gameHelper'

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
      isLoading: true,
      games: {
        featured: null,
        newPlayerRT: null,
        standardRT: null,
        standardTB: null,
        oneVsOneRT: null,
        oneVsOneTB: null,
        thirtyTwoPlayerRT: null,
        special: null
      }
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

      this.games.featured = this.getFeaturedGame()
      this.games.newPlayerRT = this.getOfficialGame('new_player_rt')
      this.games.standardRT = this.getOfficialGame('standard_rt')
      this.games.standardTB = this.getOfficialGame('standard_tb')
      this.games.oneVsOneRT = this.getOfficialGame('1v1_rt')
      this.games.oneVsOneTB = this.getOfficialGame('1v1_tb')
      this.games.thirtyTwoPlayerRT = this.getOfficialGame('32_player_rt')
      this.games.special = this.getSpecialGame()
    } catch (err) {
      console.error(err)
    }

    this.isLoading = false
  },
  methods: {
    routeToPath (path, query) {
      router.push({path, query})
    },
    getOfficialGame (type) {
      return this.serverGames.find(x => x.settings.general.type === type)
    },
    getSpecialGame () {
      const types = [
        'special_dark',
        'special_ultraDark',
        'special_orbital',
        'special_battleRoyale',
        'special_homeStar',
        'special_anonymous'
      ]
      
      return this.serverGames.find(x => types.includes(x.settings.general.type))
    },
    getFeaturedGame () {
      let featuredOfficial = this.serverGames.find(x => x.settings.general.featured)

      if (featuredOfficial) {
        return featuredOfficial
      }

      return this.userGames.find(x => x.settings.general.featured)
    },
    getGameTypeFriendlyText (game) {
      return GameHelper.getGameTypeFriendlyText(game)
    },
    async viewTutorial () {
      try {
        let response = await gameService.createTutorialGame()

        if (response.status === 201) {
          router.push({ name: 'game', query: { id: response.data } })
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
.card {
  height: 125px;
  margin-bottom: 1rem;
  cursor: pointer;
}

.featured-card {
  height: 200px;
}

.card-img {
  object-fit: cover;
  max-width: 100%;
  max-height: 100%;
}

/* .featured-card .card-img {
  max-height: 250px;
} */

.card-img-overlay {
  padding: 0.5rem;
}

.card-title {
  background-color: #375a7f;
  padding: 0.25rem;
  display: inline-block;
  border-radius: 3px;
}

.featured-card-title {
  background-color: #00bc8c;
}

.new-player-card-title {
  background-color: #f39c12;
}

.tutorial-card-title {
  background-color: #3498DB;
}

.standard-card-title {
  background-color: #00bc8c;
}

.special-card-title {
  background-color: #d62c1a;
}

.card-subtitle {
  font-size: 12px;
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 8px;
  background-color: #3498DB;
}

p.card-subtitle {
  font-size: 10px;
}

.new-player-card-subtitle {
  background-color: #f39c12;
}

.standard-card-subtitle {
  background-color: #00bc8c;
}

.special-card-subtitle {
  background-color: #d62c1a;
}

.new-player-game {
  border: 3px solid #f39c12;
}

.tutorial-game {
  border: 3px solid #3498DB;
}

.standard-game {
  border: 3px solid #00bc8c;
}

.special-game {
  border: 3px solid #d62c1a;
}
</style>
