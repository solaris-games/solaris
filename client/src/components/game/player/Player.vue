<template>
<div class="container bg-secondary">
    <overview :game="game" :player="player" />

    <achievements v-if="user" :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <badges v-if="user" :user="user"/>
</div>
</template>

<script>
import Overview from './Overview'
import Achievements from './Achievements'
import Badges from './Badges'
import apiService from '../../../services/apiService'

export default {
  components: {
    'overview': Overview,
    'achievements': Achievements,
    'badges': Badges
  },
  props: {
    game: Object,
    player: Object
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

        console.log(this.user)
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
