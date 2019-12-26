<template>
<div class="container bg-secondary">
    <h3 class="pt-2">Player</h3>

    <div class="row" :style="{'background-color':player.colour.value.replace('0x', '#')}">
        <div class="col">
            <h4 class="pt-2">{{player.alias}}</h4>
        </div>
    </div>

    <div class="row">
        <div class="col-auto">
            <div class="row col pl-0 pr-0">
                <img src="../../../assets/avatars/0.jpg">
            </div>
            <div class="row bg-primary">
                <div class="col pt-2 pb-2">
                    <button class="btn btn-primary"><i class="fas fa-envelope"></i></button>
                    <button class="btn btn-info ml-1"><i class="fas fa-chart-line"></i></button>
                </div>
            </div>
        </div>
        <div class="col pr-0">
            <statistics :game="game" :player="player"/>
        </div>
    </div>

    <achievements v-if="user" :victories="user.achievements.victories"
                    :rank="user.achievements.rank"
                    :renown="user.achievements.renown"/>

    <badges v-if="user" :user="user"/>
</div>
</template>

<script>
import Achievements from './Achievements'
import Badges from './Badges'
import Statistics from './Statistics'
import apiService from '../../../services/apiService'

export default {
  components: {
    'achievements': Achievements,
    'badges': Badges,
    'statistics': Statistics
  },
  props: {
    game: Object,
    player: Object,
    user: Object
  },
  async mounted () {
    // If there is a legit user associated with this user then get the
    // user info so we can show more info like achievements.
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
