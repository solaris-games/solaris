<template>
<div v-if="player">
  <player-title :player="player"/>

  <div class="row pt-0">
      <div class="col-auto text-center ps-0 pe-0">
        <img v-if="player.avatar" :src="getAvatarImage()" :alt="player.alias">
        <i v-if="!player.avatar" class="far fa-user me-2 mt-2 ms-2 mb-2" style="font-size:100px;"></i>
      </div>
      <div class="col bg-dark">
          <statistics :playerId="playerId"/>
      </div>
  </div>

  <div class="row pt-2 pb-2 bg-dark" v-if="!(!userPlayer || !gameHasStarted || player.userId)">
    <div class="col">
      <button class="btn btn-outline-secondary me-1" @click="onOpenDiplomacyRequested" title="Open Diplomacy" v-if="isFormalAlliancesEnabled">
        <i class="fas fa-globe-americas"></i>
      </button>
      <button class="btn btn-outline-secondary me-1" @click="onOpenLedgerRequested" title="Open Ledger" v-if="isTradeEnabled">
        <i class="fas fa-file-invoice-dollar"></i>
      </button>
      <button class="btn btn-outline-secondary" @click="onViewCompareIntelRequested" title="Compare Intel" v-if="!isDarkModeExtra">
        <i class="fas fa-chart-line"></i>
      </button>
    </div>
    <div class="col-auto">
      <button class="btn btn-primary me-1" @click="onViewColourOverrideRequested">
        <i class="fas fa-paint-brush" />
        <span v-if="!isCompactUIStyle" class="d-none d-md-inline-block ms-1">Customise colour</span>
      </button>
      <button class="btn btn-success me-1" @click="onViewConversationRequested"
        :class="{'btn-warning': conversation && conversation.unreadCount}"
        v-if="canCreateConversation">
        <i class="fas fa-envelope"></i>
        <span v-if="conversation && conversation.unreadCount" class="ms-1">{{conversation.unreadCount}}</span>
      </button>
      <button class="btn btn-info" v-if="!gameHasFinished && isTradeEnabled" @click="onOpenTradeRequested">
        <i class="fas fa-handshake" />
        <span v-if="!isCompactUIStyle" class="d-none d-md-inline-block ms-1">Trade</span>
      </button>
    </div>
  </div>
</div>
</template>

<script>
import eventBus from '../../../../eventBus'
import MENU_STATES from '../../../../services/data/menuStates'
import Statistics from './Statistics.vue'
import PlayerTitleVue from './PlayerTitle.vue'
import gameHelper from '../../../../services/gameHelper'
import ConversationApiService from '../../../../services/api/conversation'
import DiplomacyHelper from '../../../../services/diplomacyHelper'

export default {
  components: {
    'statistics': Statistics,
    'player-title': PlayerTitleVue
  },
  props: {
    playerId: String
  },
  data () {
    return {
      userPlayer: null,
      player: null,
      gameHasStarted: null,
      gameHasFinished: null,
      conversation: null
    }
  },
  async mounted () {
    this.userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
    this.player = gameHelper.getPlayerById(this.$store.state.game, this.playerId)

    this.gameHasStarted = this.$store.state.game.state.startDate != null
    this.gameHasFinished = this.$store.state.game.state.endDate != null

    await this.loadConversation()
  },
  methods: {
    onViewColourOverrideRequested (e) {
      this.$emit('onViewColourOverrideRequested', this.playerId);
    },
    onViewConversationRequested (e) {
      if (this.conversation) {
        eventBus.$emit('onViewConversationRequested', {
          conversationId: this.conversation._id
        })
      } else {
        eventBus.$emit('onViewConversationRequested', {
          participantIds: [
            this.userPlayer._id,
            this.player._id
          ]
        })
      }
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', this.player._id)
    },
    onOpenTradeRequested (e) {
      this.$emit('onOpenTradeRequested', this.playerId)
    },
    onOpenDiplomacyRequested (e) {
      this.$store.commit('setMenuState', {
        state: MENU_STATES.DIPLOMACY
      })
    },
    onOpenLedgerRequested (e) {
      this.$store.commit('setMenuState', {
        state: MENU_STATES.LEDGER
      })
    },
    getAvatarImage () {
      try {
        return new URL(`../../../../assets/avatars/${this.player.avatar}`, import.meta.url).href
      } catch (err) {
        console.error(err)

        return null
      }
    },
    async loadConversation () {
      if (this.userPlayer && this.userPlayer._id !== this.player._id) {
        try {
          let response = await ConversationApiService.privateChatSummary(this.$store.state.game._id, this.player._id)

          if (response.status === 200) {
            this.conversation = response.data
          }
        } catch (err) {
          console.error(err)
        }
      }
    }
  },
  computed: {
    isDarkModeExtra () {
      return gameHelper.isDarkModeExtra(this.$store.state.game)
    },
    isTradeEnabled () {
      return gameHelper.isTradeEnabled(this.$store.state.game)
    },
    canCreateConversation: function () {
      return this.$store.state.game.settings.general.playerLimit > 2
        && !gameHelper.isTutorialGame(this.$store.state.game)
    },
    isFormalAlliancesEnabled () {
      return DiplomacyHelper.isFormalAlliancesEnabled(this.$store.state.game)
    },
    isCompactUIStyle () {
      return this.$store.state.settings.interface.uiStyle === 'compact';
    }
  }
}
</script>

<style scoped>
</style>
