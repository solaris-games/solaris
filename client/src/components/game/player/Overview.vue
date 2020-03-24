<template>
<div>
  <!-- TODO: Text for premium player and lifetime premium player -->
  <h3 class="pt-2">Player</h3>

  <div class="row" :style="{'background-color':player.colour.value.replace('0x', '#')}">
      <div class="col">
          <h4 class="pt-2">{{player.alias}}</h4>
      </div>
  </div>

  <div class="row">
      <div class="col-auto">
          <div class="row col pt-4 pb-2">
              <!-- TODO: Prefer images over font awesome icons? -->
              <i class="far fa-user" style="font-size:100px;"></i>
              <!-- <img src="" height="100"> -->
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
</div>
</template>

<script>
import Statistics from './Statistics'
import apiService from '../../../services/apiService'

export default {
  components: {
    'statistics': Statistics
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
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
