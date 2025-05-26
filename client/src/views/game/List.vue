<script setup>
import featuredImg from '../../assets/screenshots/featured.png';
import newPlayerRtImg from '../../assets/screenshots/new_player_rt.png';
import standardRtImg from '../../assets/screenshots/standard_rt.png';
import standardTbImg from '../../assets/screenshots/standard_tb.png';
import duelRtImg from '../../assets/screenshots/1v1_rt.png';
import duelTbImg from '../../assets/screenshots/1v1_tb.png';
import large32Img from '../../assets/screenshots/32_player.png';
import relaxed16Img from '../../assets/screenshots/16_player_relaxed.png';
</script>

<template>
  <view-container :is-auth-page="true">
    <view-title title="Join Game" />

    <community-guidelines-bar />

    <div class="row bg-warning p-2 mb-4" title="Email notifications deprecation notice">
      <span>
      Email notifications will be deprecated in the upcoming months for technical reasons.
      Please review your notification settings in your <router-link :to="{ name: 'account-settings' }" tag="a">Account Settings</router-link>.
      </span>
    </div>

    <flux-bar class="mb-2"/>

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="tab" href="#newGames">New Games</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#tutorials">Tutorials</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#inProgressGames">In Progress</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#recentlyCompletedGames">Recent</a>
      </li>
    </ul>

    <div class="tab-content pt-2">
        <div class="tab-pane fade show active" id="newGames">
          <h4 v-if="games.featured">Featured Game</h4>

          <div class="row" v-if="!isLoading">
            <!-- Featured -->
            <div class="col-sm-12 col-md-12 col-lg-12 mb-0" v-if="games.featured">
              <div class="card featured-card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.featured._id })">
                <img class="card-img" :src="featuredImg" alt="Featured Game">
                <div class="card-img-overlay">
                  <h4 class="card-title featured-card-title">
                    <i class="fas fa-star"></i>
                    <span class="ms-0">
                      {{games.featured.settings.general.name}}
                    </span>
                  </h4>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.featured)}}
                    ({{games.featured.state.players}}/{{games.featured.settings.general.playerLimit}})
                  </p>
                </div>
                <locked-game-overlay :game="games.featured"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>
          </div>

          <hr v-if="games.featured"/>

          <h4>Standard Games</h4>

          <p>These are official games and award rank points.<help-tooltip class="ms-1" tooltip="Note: New Player games do not award rank points - 1v1 games do not award galactic credits"/></p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !serverGames.length" class="text-danger mb-2">
            There are no official games available.
          </p>

          <div class="row" v-if="!isLoading">
            <!-- New Player -->
            <div class="col-sm-12 col-md-6 col-lg-6" v-if="games.newPlayerRT">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.newPlayerRT._id })">
                <img class="card-img" :src="newPlayerRtImg" alt="View New Player Game">
                <div class="card-img-overlay">
                  <h5 class="card-title new-player-card-title">
                    <i class="fas fa-user-graduate"></i>
                    <span class="ms-2">{{getGameTypeFriendlyText(games.newPlayerRT)}}</span>
                  </h5>
                  <p class="card-title card-subtitle new-player-card-subtitle">
                    {{games.newPlayerRT.settings.general.name}}
                    ({{games.newPlayerRT.state.players}}/{{games.newPlayerRT.settings.general.playerLimit}})
                  </p>
                </div>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            <!-- Special Game -->
            <div class="col-sm-12 col-md-6 col-lg-6" v-if="games.special">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.special._id })">
                <img class="card-img" :src="specialGameSrc" alt="Special Game">
                <div class="card-img-overlay">
                  <h5 class="card-title special-card-title">
                    <i class="fas" :class="{
                      'fa-moon': games.special.settings.general.type === 'special_dark',
                      'fa-moon': games.special.settings.general.type === 'special_fog',
                      'fa-moon': games.special.settings.general.type === 'special_ultraDark',
                      'fa-drumstick-bite': games.special.settings.general.type === 'special_battleRoyale',
                      'fa-satellite': games.special.settings.general.type === 'special_orbital',
                      'fa-home': games.special.settings.general.type === 'special_homeStar',
                      'fa-gun': games.special.settings.general.type === 'special_homeStarElimination',
                      'fa-user-secret': games.special.settings.general.type === 'special_anonymous',
                      'fa-crown': games.special.settings.general.type === 'special_kingOfTheHill',
                      'fa-search': games.special.settings.general.type === 'special_tinyGalaxy',
                      'fa-user-secret': games.special.settings.general.type === 'special_freeForAll',
                      'fa-gamepad': games.special.settings.general.type === 'special_arcade'
                    }"></i>
                    <span class="ms-2">{{games.special.settings.general.name}}</span>
                  </h5>
                  <p class="card-title card-subtitle special-card-subtitle">
                    {{getGameTypeFriendlyText(games.special)}}
                    ({{games.special.state.players}}/{{games.special.settings.general.playerLimit}}) -
                    <strong>x2 Rank Points</strong>
                  </p>
                </div>
                <locked-game-overlay :game="games.special"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            <!-- Standard -->
            <div class="col-sm-12 col-md-3 col-lg-3" v-if="games.standardRT">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.standardRT._id })">
                <img class="card-img" :src="standardRtImg" alt="Standard Game">
                <div class="card-img-overlay">
                  <h6 class="card-title standard-card-title">
                    <i class="fas fa-user-astronaut"></i>
                    <span class="ms-2">{{games.standardRT.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle standard-card-subtitle">
                    {{getGameTypeFriendlyText(games.standardRT)}}
                    ({{games.standardRT.state.players}}/{{games.standardRT.settings.general.playerLimit}})
                  </p>
                </div>
                <locked-game-overlay :game="games.standardRT"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            <!-- Standard TB -->
            <div class="col-sm-12 col-md-3 col-lg-3" v-if="games.standardTB">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.standardTB._id })">
                <img class="card-img" :src="standardTbImg" alt="Standard Turn Based Game">
                <div class="card-img-overlay">
                  <h6 class="card-title">
                    <i class="fas fa-user-astronaut"></i>
                    <span class="ms-2">{{games.standardTB.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.standardTB)}}
                    ({{games.standardTB.state.players}}/{{games.standardTB.settings.general.playerLimit}})
                  </p>
                </div>
                <locked-game-overlay :game="games.standardTB"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            <!-- 1v1 -->
            <div class="col-sm-12 col-md-3 col-lg-3" v-if="games.oneVsOneRT">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.oneVsOneRT._id })">
                <img class="card-img" :src="duelRtImg" alt="1 vs. 1 Game">
                <div class="card-img-overlay">
                  <h6 class="card-title">
                    <i class="fas fa-user-friends"></i>
                    <span class="ms-2">{{games.oneVsOneRT.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.oneVsOneRT)}}
                    ({{games.oneVsOneRT.state.players}}/{{games.oneVsOneRT.settings.general.playerLimit}})
                  </p>
                </div>
                <locked-game-overlay :game="games.oneVsOneRT"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            <!-- 1v1 TB -->
            <div class="col-sm-12 col-md-3 col-lg-3" v-if="games.oneVsOneTB">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.oneVsOneTB._id })">
                <img class="card-img" :src="duelTbImg" alt="1 vs. 1 Turn Based Game">
                <div class="card-img-overlay">
                  <h6 class="card-title">
                    <i class="fas fa-user-friends"></i>
                    <span class="ms-2">{{games.oneVsOneTB.settings.general.name}}</span>
                  </h6>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.oneVsOneTB)}}
                    ({{games.oneVsOneTB.state.players}}/{{games.oneVsOneTB.settings.general.playerLimit}})
                  </p>
                </div>
                <locked-game-overlay :game="games.oneVsOneTB"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            <!-- 32 Player -->
            <div class="col-sm-12 col-md-12 col-lg-12" v-if="games.thirtyTwoPlayerRT">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.thirtyTwoPlayerRT._id })">
                <img class="card-img" :src="large32Img" alt="32 Player Game">
                <div class="card-img-overlay">
                  <h5 class="card-title">
                    <i class="fas fa-users"></i>
                    <span class="ms-2">{{games.thirtyTwoPlayerRT.settings.general.name}}</span>
                  </h5>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.thirtyTwoPlayerRT)}}
                    ({{games.thirtyTwoPlayerRT.state.players}}/{{games.thirtyTwoPlayerRT.settings.general.playerLimit}})
                  </p>
                </div>
                <locked-game-overlay :game="games.thirtyTwoPlayerRT"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            <!-- 16 player relaxed -->
            <div class="col-sm-12 col-md-12 col-lg-12" v-if="games.sixteenPlayerRelaxed">
              <div class="card bg-dark text-white p-1" @click="routeToPath('/game/detail', { id: games.sixteenPlayerRelaxed._id })">
                <img class="card-img" :src="relaxed16Img" alt="16 Player Relaxed Game">
                <div class="card-img-overlay">
                  <h5 class="card-title">
                    <i class="fas fa-users"></i>
                    <span class="ms-2">{{games.sixteenPlayerRelaxed.settings.general.name}}</span>
                  </h5>
                  <p class="card-title card-subtitle">
                    {{getGameTypeFriendlyText(games.sixteenPlayerRelaxed)}}
                    ({{games.sixteenPlayerRelaxed.state.players}}/{{games.sixteenPlayerRelaxed.settings.general.playerLimit}})
                  </p>
                </div>
                <locked-game-overlay :game="games.sixteenPlayerRelaxed"/>
                <div class="card-arrow">
                  <div class="card-arrow-top-left"></div>
                  <div class="card-arrow-top-right"></div>
                  <div class="card-arrow-bottom-left"></div>
                  <div class="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-end" v-if="!isLoading">
            <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ms-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>

          <hr/>

          <tutorial-game />

          <hr/>

          <h4 class="mb-0">User Created Games</h4>

          <p class="mb-2"><small class="text-warning" v-if="userGames.length">Total Games: {{userGames.length}}</small></p>

          <p>These are custom games. <strong>Featured games</strong> will award rank points.</p>

          <loading-spinner :loading="isLoading"/>

          <div v-if="!isLoading && !userGames.length" class="text-warning mb-2">
            There are no user created games available.
          </div>

          <table v-if="!isLoading && userGames.length" class="table table-striped table-hover">
              <thead class="table-dark">
                  <tr>
                      <td>Name</td>
                      <td class="d-none d-md-table-cell text-center">Players</td>
                      <td></td>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in userGames" v-bind:key="game._id">
                      <td>
                        {{game.settings.general.name}}
                        <span class="badge bg-success" v-if="game.settings.general.featured">Featured</span>
                      </td>
                      <td class="d-none d-md-table-cell text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                      <td>
                          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-outline-success float-end">
                            <span class="d-none d-md-block">View</span>
                            <span class="d-xs-block d-sm-block d-md-none">
                              {{game.state.players}}/{{game.settings.general.playerLimit}}
                            </span>
                          </router-link>
                      </td>
                  </tr>
              </tbody>
          </table>

          <div class="text-end" v-if="!isLoading">
            <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ms-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>
        </div>

        <div class="tab-pane fade" id="tutorials">
          <h4>Tutorials</h4>

          <p class="mb-1">These tutorial games help you learn to play Solaris.</p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !tutorialGames.length" class="text-danger mb-2">
            There are no tutorial games currently available.
          </p>

          <table v-if="!isLoading && tutorialGames.length" class="table table-striped table-hover">
              <thead class="table-dark">
                  <tr>
                      <th>Name</th>
                      <th class="text-center">Level</th>
                      <th class="text-center">Completed</th>
                      <th></th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="tutorial in tutorialGames" v-bind:key="tutorial.key">
                      <td>
                        {{tutorial.name}}
                      </td>
                      <td class="d-none d-sm-table-cell text-center">{{tutorial.level}}</td>
                      <td class="d-none d-sm-table-cell text-center"><i v-if="tutorial.completed" class="fas fa-check"></i></td>
                      <td class="">
                        <div v-if="tutorial.file">
                          <button v-if="!tutorial.completed" @click="startTutorial(tutorial.key)" class="btn btn-warning float-end"><i class="fas fa-graduation-cap"></i> Start Tutorial</button>
                          <button v-if="tutorial.completed" @click="startTutorial(tutorial.key)" class="btn btn-info float-end"><i class="fas fa-graduation-cap"></i> Restart Tutorial</button>
                        </div>
                      </td>
                  </tr>
              </tbody>
          </table>

          <div class="text-end" v-if="!isLoading">
            <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ms-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>
        </div>

        <div class="tab-pane fade" id="inProgressGames">
          <h4>In Progress Games</h4>

          <p class="mb-1">These games are in progress, you can join games with open slots. <b>Fill slots to earn additional rank points!</b> <help-tooltip class="ms-1" tooltip="Players who fill an AFK slot and will be awarded 1.5x additional rank (minimum 1) when the game ends"/></p>

          <p class="mb-2"><small class="text-warning" v-if="inProgressGames.length">Total Games: {{inProgressGames.length}}</small></p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !inProgressGames.length" class="text-danger mb-2">
            There are no games currently in progress.
          </p>

          <table v-if="!isLoading && inProgressGames.length" class="table table-striped table-hover">
              <thead class="table-dark">
                  <tr>
                      <th>Name</th>
                      <th class="d-none d-md-table-cell text-center">Players</th>
                      <th class="d-none d-sm-table-cell text-center">Cycle</th>
                      <th></th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in inProgressGames" v-bind:key="game._id">
                      <td>
                        <router-link :to="{ path: '/game/detail', query: { id: game._id } }">{{game.settings.general.name}}</router-link>
                        <br v-if="game.state.openSlots"/>
                        <span class="badge bg-warning" v-if="game.state.openSlots">{{game.state.openSlots}} Open Slot<span v-if="game.state.openSlots > 1">s</span></span>
                        <br/>
                        <small>{{getGameTypeFriendlyText(game)}}</small>
                      </td>
                      <td class="d-none d-md-table-cell text-center" :class="{'text-warning':game.state.openSlots}">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                      <td class="d-none d-sm-table-cell text-center">{{game.state.productionTick}}</td>
                      <td>
                          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-outline-success float-end">
                            <span class="d-none d-md-block">View</span>
                            <span class="d-xs-block d-sm-block d-md-none">
                              {{game.state.players}}/{{game.settings.general.playerLimit}}
                            </span>
                          </router-link>
                      </td>
                  </tr>
              </tbody>
          </table>

          <div class="text-end" v-if="!isLoading">
            <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ms-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>
        </div>

        <div class="tab-pane fade" id="recentlyCompletedGames">
          <h4>Recently Completed Games</h4>

          <p class="mb-1">These are games that finished recently, you can view the end result.</p>

          <loading-spinner :loading="isLoading"/>

          <p v-if="!isLoading && !recentlyCompletedGames.length" class="text-danger mb-2">
            There are no recent games to display.
          </p>

          <table v-if="!isLoading && recentlyCompletedGames.length" class="table table-striped table-hover">
              <thead class="table-dark">
                  <tr>
                      <th>Name</th>
                      <th class="d-none d-md-table-cell text-center">Ended</th>
                      <th class="d-none d-sm-table-cell text-center">Cycles</th>
                      <th></th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="game in recentlyCompletedGames" v-bind:key="game._id">
                      <td>
                        <router-link :to="{ path: '/game', query: { id: game._id } }">{{game.settings.general.name}}</router-link>
                        <br/>
                        <small>{{getGameTypeFriendlyText(game)}}</small>
                      </td>
                      <td class="d-none d-md-table-cell text-center">{{getFriendlyDate(game.state.endDate)}}</td>
                      <td class="d-none d-sm-table-cell text-center">{{game.state.productionTick}}</td>
                      <td>
                          <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-outline-success float-end">
                            <span>View</span>
                          </router-link>
                      </td>
                  </tr>
              </tbody>
          </table>

          <div class="text-end" v-if="!isLoading">
            <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
            <router-link to="/game/active-games" tag="button" class="btn btn-success ms-1"><i class="fas fa-dice"></i> View My Games</router-link>
          </div>
        </div>
    </div>
  </view-container>
</template>

<script>
import router from '../../router'
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ViewContainer from '../components/ViewContainer.vue'
import TutorialGame from './components/menu/TutorialGame.vue'
import gameService from '../../services/api/game'
import GameHelper from '../../services/gameHelper'
import RandomHelper from '../../services/randomHelper'
import HelpTooltip from '../components/HelpTooltip.vue'
import FluxBar from './components/menu/FluxBar.vue'
import LockedGameOverlay from './components/menu/LockedGameOverlay.vue'
import moment from 'moment'
import CommunityGuidelinesBar from "./components/menu/CommunityGuidelinesBar.vue";

export default {
  components: {
    'community-guidelines-bar': CommunityGuidelinesBar,
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'tutorial-game': TutorialGame,
    'help-tooltip': HelpTooltip,
    'flux-bar': FluxBar,
    'locked-game-overlay': LockedGameOverlay,
  },
  data () {
    return {
      serverGames: [],
      userGames: [],
      inProgressGames: [],
      recentlyCompletedGames: [],
      tutorialGames: [],
      isLoading: true,
      games: {
        featured: null,
        newPlayerRT: null,
        standardRT: null,
        standardTB: null,
        oneVsOneRT: null,
        oneVsOneTB: null,
        thirtyTwoPlayerRT: null,
        sixteenPlayerRelaxed: null,
        special: null
      }
    }
  },
  async mounted () {
    this.isLoading = true

    try {
      let response = await gameService.listJoinGamesSummary()

      if (response.status === 200) {
        this.serverGames = response.data.official
        this.userGames = response.data.user
        this.inProgressGames = response.data.inProgress
        this.recentlyCompletedGames = response.data.completed

        this.games.featured = this.getFeaturedGame()
        this.games.newPlayerRT = this.getOfficialGame('new_player_rt')
        this.games.standardRT = this.getOfficialGame('standard_rt')
        this.games.standardTB = this.getOfficialGame('standard_tb')
        this.games.oneVsOneRT = this.getOfficialGame('1v1_rt')
        this.games.oneVsOneTB = this.getOfficialGame('1v1_tb')
        this.games.thirtyTwoPlayerRT = this.getOfficialGame('32_player_rt')
        this.games.sixteenPlayerRelaxed = this.getOfficialGame('16_player_relaxed')
        this.games.special = this.getSpecialGame()
      }
    } catch (err) {
      console.error(err)
    }

    try {
      let response = await gameService.listTutorialGames()

      if (response.status === 200) {
        this.tutorialGames = response.data
      }
    } catch (err) {
      console.error(err)
    }

    this.isLoading = false
  },
  computed: {
    specialGameSrc () {
      return new URL(`../../assets/screenshots/${this.games.special.settings.general.type}.png`, import.meta.url).href;
    }
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
        'special_fog',
        'special_ultraDark',
        'special_orbital',
        'special_battleRoyale',
        'special_homeStar',
        'special_homeStarElimination',
        'special_anonymous',
        'special_kingOfTheHill',
        'special_tinyGalaxy',
        'special_freeForAll',
        'special_arcade'
      ]

      return this.serverGames.find(x => types.includes(x.settings.general.type))
    },
    getFeaturedGame () {
      let featuredGames = this.serverGames.filter(x => x.settings.general.featured).concat(this.userGames.filter(x => x.settings.general.featured))

      if (featuredGames.length) {
        return featuredGames[RandomHelper.getRandomNumberBetween(0, featuredGames.length - 1)]
      }

      return null
    },
    getGameTypeFriendlyText (game) {
      return GameHelper.getGameTypeFriendlyText(game)
    },
    getFriendlyDate(date) {
      return moment(date).utc().fromNow()
    },
    async startTutorial (tutorialKey) {
      try {
          let response = await gameService.createTutorialGame(tutorialKey)

          if (response.status === 201) {
              this.$store.commit('clearTutorialPage')
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
}

.featured-card-title {
  background-color: #00bc8c;
}

.new-player-card-title {
  background-color: #f39c12;
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

.new-player-card-subtitle {
  background-color: #f39c12;
}

.standard-card-subtitle {
  background-color: #00bc8c;
}

.special-card-subtitle {
  background-color: #d62c1a;
}
</style>
