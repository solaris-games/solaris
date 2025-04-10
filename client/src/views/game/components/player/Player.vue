<template>
<div class="menu-page container">
    <menu-title title="Player" @onCloseRequested="onCloseRequested">
      <span class="me-2" v-if="user && user.roles">
        <i class="fas fa-hands-helping" v-if="user.roles.contributor" title="This player is a contributor"></i>
        <i class="fas fa-code ms-1" v-if="user.roles.developer" title="This player is an active developer"></i>
        <i class="fas fa-user-friends ms-1" v-if="user.roles.communityManager" title="This player is an active community manager"></i>
        <i class="fas fa-dice ms-1" v-if="user.roles.gameMaster" title="This player is an active game master"></i>
      </span>
      <elo-rating v-if="is1v1Game" :user="user" class="me-2"/>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-sm btn-outline-info"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <overview v-if="player" :playerId="player._id"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"
      @onOpenTradeRequested="onOpenTradeRequested"
      @onViewColourOverrideRequested="onViewColourOverrideRequested"
    />

    <h4 v-if="player" class="mt-2">Infrastructure</h4>

    <infrastructure v-if="player" :playerId="player._id"/>

    <yourInfrastructure v-if="userPlayer && player != userPlayer"
                    :comparePlayerId="player._id"/>

    <h4 v-if="player && player.research" class="mt-2">Technology</h4>

    <research v-if="player && player.research" :playerId="player._id"/>

    <loading-spinner :loading="player && !player.isOpenSlot && !user"/>

    <h4 class="mt-2" v-if="canViewAchievements">Achievements</h4>

    <achievements v-if="canViewAchievements"
                    :level="user.achievements.level"
                    :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <sendRenown v-if="canSendRenown" :player="player" :userPlayer="userPlayer"
      @onRenownSent="onRenownSent"/>

    <h4 class="mt-2" v-if="canAwardBadge">Badges</h4>

    <player-badges v-if="canAwardBadge"
      :playerId="player._id"
      @onOpenPurchasePlayerBadgeRequested="onOpenPurchasePlayerBadgeRequested"/>

    <player-report
      v-if="player && player.isRealUser && userPlayer && player !== userPlayer"
      :playerId="player._id"
      @onOpenReportPlayerRequested="onOpenReportPlayerRequested"/>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner.vue'
import MenuTitle from '../MenuTitle.vue'
import Overview from './Overview.vue'
import Infrastructure from '../shared/Infrastructure.vue'
import YourInfrastructure from './YourInfrastructure.vue'
import Research from './Research.vue'
import Achievements from './Achievements.vue'
import SendRenown from './SendRenown.vue'
import PlayerBadges from '../badges/PlayerBadges.vue'
import Reputation from './Reputation.vue'
import EloRating from './EloRating.vue'
import PlayerReport from './PlayerReport.vue'
import gameService from '../../../../services/api/game'
import GameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';

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
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
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
    this.leaderboard = GameHelper.getSortedLeaderboardPlayerList(this.$store.state.game)

    // If there is a legit user associated with this user then get the
    // user info so we can show more info like achievements.
    if (this.$store.state.userId && !this.player.isOpenSlot && GameHelper.isNormalAnonymity(this.$store.state.game)) {
      try {
        const response = await gameService.getPlayerUserInfo(this.$store.state.game._id, this.player._id)

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
    onViewColourOverrideRequested (e) {
      this.$emit('onViewColourOverrideRequested', e);
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
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: this.player });
    },
    onOpenPrevPlayerDetailRequested (e) {
      let prevLeaderboardIndex = this.leaderboard.indexOf(this.player) - 1;

      if (prevLeaderboardIndex < 0) {
        prevLeaderboardIndex = this.leaderboard.length - 1;
      }

      let prevPlayer = this.leaderboard[prevLeaderboardIndex];

      this.onOpenPlayerDetailRequested(prevPlayer);
    },
    onOpenNextPlayerDetailRequested (e) {
      let nextLeaderboardIndex = this.leaderboard.indexOf(this.player) + 1;

      if (nextLeaderboardIndex > this.leaderboard.length - 1) {
        nextLeaderboardIndex = 0;
      }

      let nextPlayer = this.leaderboard[nextLeaderboardIndex];

      this.onOpenPlayerDetailRequested(nextPlayer);
    },
    onOpenPlayerDetailRequested (player) {
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
      return this.player && this.player.isRealUser && this.user && this.user.achievements
    },
    canSendRenown () {
      if (this.isAnonymousGame) {
        return this.player && this.game.state.startDate && this.player.isRealUser && this.userPlayer && this.player != this.userPlayer && this.isGameFinished
      } else {
        return this.player && this.game.state.startDate && this.player.isRealUser && this.userPlayer && this.player != this.userPlayer
      }
    },
    canAwardBadge () {
      return this.player && this.player.isRealUser && this.userPlayer && this.player != this.userPlayer
    }
  }
}
</script>

<style scoped>
</style>
