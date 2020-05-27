<template>
<div class="container">
    <!-- TODO: Text for premium player and lifetime premium player -->
    <menu-title title="Player" @onCloseRequested="onCloseRequested"/>
  
    <overview :player="player" @onViewConversationRequested="onViewConversationRequested"/>

    <h4 v-if="userPlayer" class="mt-2">Infrastructure</h4>

    <!-- TODO: These do not update on socket messages (e.g infrastructure upgrades)
      because their values come from the stats object and are not calculated on the client -->
    <infrastructure v-if="userPlayer"
                    :isTotal="true" 
                    :economy="player.stats.totalEconomy"
                    :industry="player.stats.totalIndustry"
                    :science="player.stats.totalScience"/>

    <yourInfrastructure v-if="userPlayer && player != userPlayer"
                    :economy="userPlayer.stats.totalEconomy"
                    :industry="userPlayer.stats.totalIndustry"
                    :science="userPlayer.stats.totalScience"/>

    <h4 v-if="userPlayer" class="mt-2">Technology</h4>

    <research v-if="userPlayer" :player="player" :userPlayer="userPlayer"/>

    <div v-if="game.state.startDate && userPlayer && player != userPlayer && !userPlayer.defeated">
      <h4 class="mt-2">Trade</h4>

      <sendTechnology :player="player" :userPlayer="userPlayer"/>
      <sendCredits :player="player" :userPlayer="userPlayer"/>
    </div>

    <loading-spinner :loading="!player.isEmptySlot && !user"/>

    <h4 class="mt-2" v-if="!player.isEmptySlot && (user || userPlayer)">Achievements</h4>

    <achievements v-if="user" :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <sendRenown v-if="game.state.startDate && userPlayer && player != userPlayer" :player="player" :userPlayer="userPlayer"/>

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
    player: Object
  },
  data () {
    return {
      user: null,
      userPlayer: null
    }
  },
  async mounted () {
    // If there is a legit user associated with this user then get the
    // user info so we can show more info like achievements.

    // TODO: The result of this needs to cached or returned in the
    // main galaxy response.
    if (!this.player.isEmptySlot) {
      try {
        let response = await gameService.getPlayerUserInfo(this.$store.state.game._id, this.player._id)

        this.user = response.data
      } catch (err) {
        console.error(err)
      }
    }

    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', e)
    }
  },
  computed: {
    game () {
      return this.$store.state.game
    }
  }
}
</script>

<style scoped>
</style>
