<template>
<div class="menu-page container">
    <!-- TODO: Text for premium player and lifetime premium player -->
    <menu-title title="Player" @onCloseRequested="onCloseRequested">
      <span class="mr-2" v-if="user">
        <i class="fas fa-hands-helping" v-if="user.contributor" title="This player is a contributor"></i>
        <i class="fas fa-code ml-1" v-if="user.developer" title="This player is a developer"></i>
      </span>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-info"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-info ml-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-info ml-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <overview v-if="player" :playerId="player._id"
      @onViewConversationRequested="onViewConversationRequested"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"/>

    <h4 v-if="userPlayer" class="mt-2">Infrastructure</h4>

    <infrastructure v-if="userPlayer"
                    :economy="player.stats.totalEconomy"
                    :industry="player.stats.totalIndustry"
                    :science="player.stats.totalScience"/>

    <yourInfrastructure v-if="userPlayer && player != userPlayer"
                    :economy="userPlayer.stats.totalEconomy"
                    :industry="userPlayer.stats.totalIndustry"
                    :science="userPlayer.stats.totalScience"/>

    <h4 v-if="userPlayer" class="mt-2">Technology</h4>

    <research v-if="player" :playerId="player._id"/>

    <div v-if="game.state.startDate && userPlayer && player != userPlayer && !userPlayer.defeated && !isGameFinished">
      <h4 class="mt-2">Trade</h4>

      <div v-if="canTradeWithPlayer">
        <sendTechnology v-if="player" :playerId="player._id"/>
        <sendCredits :player="player" :userPlayer="userPlayer"/>
      </div>

      <p v-if="!canTradeWithPlayer" class="text-danger">You cannot trade with this player, they are not within scanning range.</p>
    </div>

    <loading-spinner :loading="player && !player.isEmptySlot && !user"/>

    <h4 class="mt-2" v-if="player && !player.isEmptySlot && isValidUser">Achievements</h4>

    <achievements v-if="isValidUser" :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <sendRenown v-if="isValidUser && game.state.startDate && userPlayer && player != userPlayer" :player="player" :userPlayer="userPlayer"
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
    'badges': Badges
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
    if (!this.player.isEmptySlot && GameHelper.isNormalAnonymity(this.$store.state.game)) {
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
      this.user.achievements.renown += e
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
      return this.$store.state.game.settings.player.tradeScanning === 'all' || (this.player && this.player.isInScanningRange)
    },
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
