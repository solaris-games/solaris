<template>
<div class="menu-page container">
    <!-- TODO: Text for premium player and lifetime premium player -->
    <menu-title title="Player" @onCloseRequested="onCloseRequested">
      <span class="mr-2" v-if="user && user.roles">
        <i class="fas fa-hands-helping" v-if="user.roles.contributor" title="This player is a contributor"></i>
        <i class="fas fa-code ml-1" v-if="user.roles.developer" title="This player is a developer"></i>
        <i class="fas fa-user-friends ml-1" v-if="user.roles.communityManager" title="This player is a community manager"></i>
      </span>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-sm btn-info"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-sm btn-info ml-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-sm btn-info ml-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <overview v-if="player" :playerId="player._id"
      @onViewConversationRequested="onViewConversationRequested"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"/>

    <h4 v-if="player" class="mt-2">Infrastructure</h4>

    <infrastructure v-if="player" :playerId="player._id"/>

    <yourInfrastructure v-if="userPlayer && player != userPlayer"
                    :economy="userPlayer.stats.totalEconomy"
                    :industry="userPlayer.stats.totalIndustry"
                    :science="userPlayer.stats.totalScience"/>

    <h4 v-if="player" class="mt-2">Technology</h4>
    
    <research v-if="player" :playerId="player._id"/>

    <div v-if="game.state.startDate && userPlayer && player != userPlayer && !userPlayer.defeated && !isGameFinished && (tradeTechnologyIsEnabled || tradeCreditsIsEnabled)">
      <h4 class="mt-2">Trade</h4>

      <div v-if="canTradeWithPlayer">
        <reputation v-if="player.defeated" :playerId="player._id"/>
        <sendTechnology v-if="player && tradeTechnologyIsEnabled" :playerId="player._id"/>
        <sendCredits v-if="tradeCreditsIsEnabled" :player="player" :userPlayer="userPlayer"/>
      </div>

      <p v-if="!canTradeWithPlayer" class="text-danger">You cannot trade with this player, they are not within scanning range.</p>
    </div>

    <loading-spinner :loading="player && !player.isEmptySlot && !user"/>

    <h4 class="mt-2" v-if="canViewAchievements">Achievements</h4>

    <achievements v-if="isValidUser" :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <sendRenown v-if="canSendRenown" :player="player" :userPlayer="userPlayer"
      @onRenownSent="onRenownSent"/>

    <!--
    <h4 class="mt-2">Badges</h4>

    <badges v-if="user" :user="user"/>
    -->
</div>
</template>

<script>
import LoadingSpinnerVue from '../../LoadingSpinner'
import MenuTitle from '../MenuTitle'
import Overview from './Overview'
import Infrastructure from '../shared/Infrastructure'
import YourInfrastructure from './YourInfrastructure'
import Research from './Research'
import SendTechnology from './SendTechnology'
import SendCredits from './SendCredits'
import Achievements from './Achievements'
import SendRenown from './SendRenown'
import Badges from './Badges'
import Reputation from './Reputation'
import gameService from '../../../services/api/game'
import GameHelper from '../../../services/gameHelper'
import GameContainer from '../../../game/container'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'overview': Overview,
    'infrastructure': Infrastructure,
    'yourInfrastructure': YourInfrastructure,
    'research': Research,
    'sendTechnology': SendTechnology,
    'sendCredits': SendCredits,
    'achievements': Achievements,
    'sendRenown': SendRenown,
    'badges': Badges,
    'reputation': Reputation
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
    if (this.$store.state.userId && !this.player.isEmptySlot && GameHelper.isNormalAnonymity(this.$store.state.game)) {
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
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', e)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', e)
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
    canTradeWithPlayer: function () {
      return this.player.stats.totalStars > 0 && (this.$store.state.game.settings.player.tradeScanning === 'all' || (this.player && this.player.isInScanningRange))
    },
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    tradeCreditsIsEnabled () {
      return this.game.settings.player.tradeCredits
    },
    tradeTechnologyIsEnabled () {
      return this.game.settings.player.tradeCost > 0
    },
    isAnonymousGame () {
      return this.game.settings.general.anonymity === 'extra'
    },
    canViewAchievements () {
      if (this.isAnonymousGame) {
        return this.player && !this.player.isEmptySlot && this.isGameFinished && this.player != this.userPlayer
      } else {
        return this.player && !this.player.isEmptySlot && this.isValidUser
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
