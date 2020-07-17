<template>
<div class="bg-secondary pb-2">
  <div class="container">
    <menu-title title="Intel" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="!history"/>
  </div>

  <div v-if="history">
    <div class="container">
        <select class="form-control input-sm" id="intelType" v-model="intelType" v-on:change="fillData" :disabled="history == null">
          <option key="totalStars" value="totalStars">Total Stars</option>
          <option key="totalEconomy" value="totalEconomy">Total Economy</option>
          <option key="totalIndustry" value="totalIndustry">Total Industry</option>
          <option key="totalScience" value="totalScience">Total Science</option>
          <option key="totalShips" value="totalShips">Total Ships</option>
          <option key="totalCarriers" value="totalCarriers">Total Carriers</option>
          <option key="weapons" value="weapons">Weapons</option>
          <option key="banking" value="banking">Banking</option>
          <option key="manufacturing" value="manufacturing">Manufacturing</option>
          <option key="hyperspace" value="hyperspace">Hyperspace</option>
          <option key="scanning" value="scanning">Scanning</option>
          <option key="experimentation" value="experimentation">Experimentation</option>
          <option key="terraforming" value="terraforming">Terraforming</option>
        </select>
    </div>

    <div class="mb-2 mt-2 ml-1 mr-1" v-if="datacollection != null">
        <line-chart :chart-data="datacollection" :options="dataoptions" />
    </div>

    <div class="pt-5 pb-5 text-center" v-if="datacollection == null">
      <h1><i class="fas fa-atom fa-spin"></i></h1>
    </div>

    <div class="container">
        <div class="row">
            <div class="col-4">
              <div class="btn-group">
                <button class="btn btn-success" @click="showAll">All</button>
                <button class="btn btn-primary mr-3" @click="showNone">None</button>
              </div>
            </div>

            <div class="col">
              <button v-for="playerFilter in playerFilters" :key="playerFilter._id" 
                class="btn mr-1 mb-1"
                :class="{'btn-primary': playerFilter.enabled}"
                @click="togglePlayerFilter(playerFilter)">
                <i class="fas fa-circle" :style="{'color': playerFilter.colour}"></i>
              </button>
            </div>
        </div>
    </div>
  </div>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MenuTitle from '../MenuTitle'
import LineChart from './LineChart.js'
import GameHelper from '../../../services/gameHelper'
import GameApiService from '../../../services/api/game'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'line-chart': LineChart
  },
  props: {
    compareWithPlayerId: String
  },
  data () {
    return {
      intelType: 'totalStars',
      history: null,
      datacollection: null,
      dataoptions: {
        bezierCurve : false,
        legend: {
          display: false
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: false,
                    precision: 0
                }
            }]
        },
        elements: {
          line: {
            tension: 0
          },
          // point:{
          //     borderWidth: 0
          // }
        }
      },
      playerFilters: []
    }
  },
  async mounted () {
    this.playerFilters = this.$store.state.game.galaxy.players.map(p => {
      return {
        enabled: true,
        playerId: p._id,
        colour: GameHelper.getPlayerColour(this.$store.state.game, p._id)
      }
    })

    if (this.compareWithPlayerId) {
      let userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

      this.playerFilters.forEach(f => {
          f.enabled = f.playerId === this.compareWithPlayerId
            || f.playerId === userPlayer._id
      })
    }

    try {
      let response = await GameApiService.getGameHistory(this.$store.state.game._id)
      
      if (response.status === 200) {
        this.history = response.data
        this.fillData()
      }
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    },
    getPlayerColour (player) {
      return GameHelper.getPlayerColour(this.$store.state.game, player._id)
    },
    togglePlayerFilter (playerFilter) {
      playerFilter.enabled = !playerFilter.enabled

      this.fillData()
    },
    showAll () {
      this.playerFilters.forEach(f => f.enabled = true)

      this.fillData()
    },
    showNone () {
      let userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

      this.playerFilters.forEach(f => f.enabled = (f.playerId === userPlayer._id))

      this.fillData()
    },
    fillData () {
      if (!this.history) {
        return
      }

      this.datacollection = null

      let dataCollection = {
        labels: [],
        datasets: []
      }

      dataCollection.labels = this.history.map(h => h.tick)

      for (let i = 0; i < this.$store.state.game.galaxy.players.length; i++) {
        let player = this.$store.state.game.galaxy.players[i]
        let playerFilter = this.playerFilters.find(f => f.playerId === player._id)

        if (!playerFilter.enabled) {
          continue
        }

        let dataset = {
          label: player.alias,
          borderColor: GameHelper.getFriendlyColour(player.colour.value),
          fill: false,
          pointRadius: 0,
          borderWidth: 3,
          pointHitRadius: 10,
          data: []
        }
        
        // Get all data points for the selected intel type.
        for (let e = 0; e < this.history.length; e++) {
          let history = this.history[e]
          let historyPlayer = history.players.find(p => p.playerId === player._id)

          dataset.data.push(historyPlayer.statistics[this.intelType])
        }

        dataCollection.datasets.push(dataset)
      }

      this.datacollection = dataCollection
    }
  }
}
</script>

<style scoped>
</style>
