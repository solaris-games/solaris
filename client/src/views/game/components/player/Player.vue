<template>
<div class="menu-page container">
    <!-- TODO: Text for premium player and lifetime premium player -->
    <menu-title title="Player" @onCloseRequested="onCloseRequested">
      <span class="mr-2" v-if="user && user.roles">
        <i class="fas fa-hands-helping" v-if="user.roles.contributor" title="This player is a contributor"></i>
        <i class="fas fa-code ml-1" v-if="user.roles.developer" title="This player is an active developer"></i>
        <i class="fas fa-user-friends ml-1" v-if="user.roles.communityManager" title="This player is an active community manager"></i>
        <i class="fas fa-dice ml-1" v-if="user.roles.gameMaster" title="This player is an active game master"></i>
      </span>
      <elo-rating v-if="is1v1Game" :user="user" class="mr-2"/>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-sm btn-info"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-sm btn-info ml-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-sm btn-info ml-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <overview v-if="player" :playerId="player._id"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"
      @onOpenTradeRequested="onOpenTradeRequested"/>

    <h4 v-if="player" class="mt-2">Infrastructure</h4>

    <infrastructure v-if="player" :playerId="player._id"/>

    <yourInfrastructure v-if="userPlayer && player != userPlayer"
                    :economy="userPlayer.stats.totalEconomy"
                    :industry="userPlayer.stats.totalIndustry"
                    :science="userPlayer.stats.totalScience"/>

    <h4 v-if="player && player.research" class="mt-2">Technology</h4>
    
    <research v-if="player && player.research" :playerId="player._id"/>

    <loading-spinner :loading="player && !player.isOpenSlot && !user"/>

    <h4 class="mt-2" v-if="canViewAchievements">Achievements</h4>

    <achievements v-if="isValidUser" :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <sendRenown v-if="canSendRenown" :player="player" :userPlayer="userPlayer"
      @onRenownSent="onRenownSent"/>

    <h4 class="mt-2" v-if="player && isValidUser">Badges</h4>

    <player-badges v-if="player && isValidUser" 
      :playerId="player._id"
      @onOpenPurchasePlayerBadgeRequested="onOpenPurchasePlayerBadgeRequested"/>

    <player-report 
      v-if="isValidUser && player && !player.isOpenSlot && userPlayer && player != userPlayer"
      :playerId="player._id"
      @onOpenReportPlayerRequested="onOpenReportPlayerRequested"/>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MenuTitle from '../MenuTitle'
import Overview from './Overview'
import Infrastructure from '../shared/Infrastructure'
import YourInfrastructure from './YourInfrastructure'
import Research from './Research'
import Achievements from './Achievements'
import SendRenown from './SendRenown'
import PlayerBadges from '../badges/PlayerBadges'
import Reputation from './Reputation'
import EloRating from './EloRating'
import PlayerReport from './PlayerReport'
import gameService from '../../../../services/api/game'
import GameHelper from '../../../../services/gameHelper'
import GameContainer from '../../../../game/container'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'overview': Overview,
    'infrastructure': Infrastructure,
    'yourInfrastructure': YourInfrastructure,
    'research': Research,
    'achievements': Achievements,
    'sendRenown': SendRenown,
    'player-badges': PlayerBadges,
    'reputation': Reputation,
    'elo-rating': EloRating,
    'player-report': PlayerReport
  },
  props: {
    playerId: String
  },
  data () {
    return {
      player: null,
      user: null,
      userPlayer: null,
      playerIndex: 0
    }
  },
  async mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.playerIndex = this.$store.state.game.galaxy.players.indexOf(this.player)

    // If there is a legit user associated with this user then get the
    // user info so we can show more info like achievements.
    if (this.$store.state.userId && !this.player.isOpenSlot && GameHelper.isNormalAnonymity(this.$store.state.game)) {
      try {
        let response = await gameService.getPlayerUserInfo(this.$store.state.game._id, this.player._id)

        this.user = response.data
      } catch (err) {
        console.error(err)
      }
    }

    if (this.user == null) {
      this.user = {}
    }
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', e)
    },
    onOpenTradeRequested (e) {
      this.$emit('onOpenTradeRequested', this.playerId)
    },
    onOpenPurchasePlayerBadgeRequested (e) {
      this.$emit('onOpenPurchasePlayerBadgeRequested', e)
    },
    onOpenReportPlayerRequested (e) {
      this.$emit('onOpenReportPlayerRequested', e)
    },
    panToPlayer (e) {
      GameContainer.map.panToPlayer(this.$store.state.game, this.player)
    },
    onOpenPrevPlayerDetailRequested (e) {
      let prevIndex = this.playerIndex - 1

      if (prevIndex < 0) {
        prevIndex = this.$store.state.game.galaxy.players.length - 1
      }

      this.onOpenPlayerDetailRequested(prevIndex)
    },
    onOpenNextPlayerDetailRequested (e) {
      let nextIndex = this.playerIndex + 1

      if (nextIndex > this.$store.state.game.galaxy.players.length - 1) {
        nextIndex = 0
      }

      this.onOpenPlayerDetailRequested(nextIndex)
    },
    onOpenPlayerDetailRequested (e) {
      let player = this.$store.state.game.galaxy.players[e]

      this.$emit('onOpenPlayerDetailRequested', player._id)
    },
    onRenownSent (e) {
      if (this.user.achievements) {
        this.user.achievements.renown += e
      }
    }
  },
  computed: {
    game () {
      return this.$store.state.game
    },
    isValidUser () {
      return this.user && this.user.achievements
    },
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    isAnonymousGame () {
      return this.game.settings.general.anonymity === 'extra'
    },
    is1v1Game () {
      return GameHelper.is1v1Game(this.game)
    },
    canViewAchievements () {
      if (this.isAnonymousGame) {
        return this.player && !this.player.isOpenSlot && this.isGameFinished && this.player != this.userPlayer
      } else {
        return this.player && !this.player.isOpenSlot && this.isValidUser
      }
    },
    canSendRenown () {
      if (this.isAnonymousGame) {
        return this.game.state.startDate && this.userPlayer && this.player != this.userPlayer && this.isGameFinished
      } else {
        return this.game.state.startDate && this.userPlayer && this.player != this.userPlayer
      }
    }
  }
}
</script>

<style scoped>
</style>
