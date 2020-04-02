<template>
<div class="container">
    <overview :game="game" :player="player" />

    <h4 v-if="userPlayer" class="mt-2">Infrastructure</h4>

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

    <research v-if="userPlayer" :game="game" :player="player" :userPlayer="userPlayer"/>

    <div v-if="userPlayer && player != userPlayer">
      <h4 class="mt-2">Trade</h4>

      <sendTechnology :game="game" :player="player" :userPlayer="userPlayer"/>
      <sendCredits :game="game" :player="player" :userPlayer="userPlayer"/>
    </div>

    <h4 class="mt-2" v-if="user || userPlayer">Achievements</h4>

    <achievements v-if="user" :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <sendRenown v-if="userPlayer && player != userPlayer" :game="game" :player="player" :userPlayer="userPlayer"/>

    <!--
    <h4 class="mt-2">Badges</h4>

    <badges v-if="user" :user="user"/>
    -->
</div>
</template>

<script>
import Overview from './Overview'
import Infrastructure from '../shared/Infrastructure'
import YourInfrastructure from './YourInfrastructure'
import Research from './Research'
import SendTechnology from './SendTechnology'
import SendCredits from './SendCredits'
import Achievements from './Achievements'
import SendRenown from './SendRenown'
import Badges from './Badges'
import apiService from '../../../services/apiService'

export default {
  components: {
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
    game: Object,
    player: Object,
    userPlayer: Object
  },
  data () {
    return {
      user: null
    }
  },
  async mounted () {
    // If there is a legit user associated with this user then get the
    // user info so we can show more info like achievements.

    // TODO: The result of this needs to cached or returned in the
    // main galaxy response.
    if (this.player.userId) {
      try {
        let response = await apiService.getUserInfo(this.player.userId)

        this.user = response.data
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
