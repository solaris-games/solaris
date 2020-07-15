<template>
 <form @submit.prevent v-if="player">
    <div class="form-group row mb-0 bg-primary">
        <label class="col col-form-label">Total Science:</label>
        <div class="col text-right">
            <label class="col-form-label">{{player.stats.totalScience}}</label>
        </div>
    </div>
    <div class="form-group row pt-2 pb-2 mb-0 bg-secondary" v-if="!player.defeated">
        <label class="col col-form-label">Researching Now:</label>
        <div class="col">
            <select class="form-control" v-model="player.researchingNow" v-on:change="updateResearchNow" v-if="!loadingNow">
                <option v-for="option in options" v-bind:value="option.value" v-bind:key="option.value">
                    {{ option.text }}
                </option>
            </select>

            <label v-if="loadingNow" class="col-form-label">Loading...</label>
        </div>
    </div>
    <div class="form-group row mb-0 bg-primary" v-if="!player.defeated">
        <label class="col col-form-label">Current Research ETA:</label>
        <div class="col text-right">
            <label class="col-form-label">{{timeRemainingEta}}</label>
        </div>
    </div>
    <div class="form-group row pt-2 pb-2 mb-2 bg-secondary" v-if="!player.defeated">
        <label class="col col-form-label">Research Next:</label>
        <div class="col">
            <select class="form-control" v-model="player.researchingNext" v-on:change="updateResearchNext" v-if="!loadingNext">
                <option v-for="option in options" v-bind:value="option.value" v-bind:key="option.value">
                    {{ option.text }}
                </option>
            </select>

            <label v-if="loadingNext" class="col-form-label">Loading...</label>
        </div>
    </div>
</form>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import TechnologyHelper from '../../../services/technologyHelper'
import researchService from '../../../services/api/research'

export default {
  data: function () {
    return {
      loadingNow: false,
      loadingNext: false,
      player: null,
      options: [],
      timeRemainingEta: null,
      intervalFunction: null
    }
  },
  mounted () {
    this.player = GameHelper.getUserPlayer(this.$store.state.game)
    this.loadTechnologies()
    
    this.recalculateTimeRemaining()

    if (!this.$store.state.game.state.paused) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
    }
  },
  methods: {
    loadTechnologies () {
      let options = [
        { text: 'Scanning', value: 'scanning' },
        { text: 'Hyperspace Range', value: 'hyperspace' },
        { text: 'Terraforming', value: 'terraforming' },
        { text: 'Experimentation', value: 'experimentation' },
        { text: 'Weapons', value: 'weapons' },
        { text: 'Banking', value: 'banking' },
        { text: 'Manufacturing', value: 'manufacturing' }
      ]

      this.options = options.filter(o => TechnologyHelper.isTechnologyEnabled(this.$store.state.game, o.value))
    },
    async updateResearchNow (e) {
      this.loadingNow = true

      try {
        let result = await researchService.updateResearchNow(this.$store.state.game._id, this.player.researchingNow)

        if (result.status === 200) {
          this.player.currentResearchTicksEta = result.data.ticksEta
          this.recalculateTimeRemaining()
          this.$toasted.show(`Current research updated.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.loadingNow = false
    },
    async updateResearchNext (e) {
      this.loadingNext = true

      try {
        let response = await researchService.updateResearchNext(this.$store.state.game._id, this.player.researchingNext)

        if (response.status === 200) {
          this.$toasted.show(`Next research updated.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.loadingNext = false
    },
    recalculateTimeRemaining () {
      let timeRemainingEtaDate = GameHelper.calculateTimeByTicks(this.player.currentResearchTicksEta, 
        this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)

      this.timeRemainingEta = GameHelper.getCountdownTimeString(this.$store.state.game, timeRemainingEtaDate)
    }
  }
}
</script>

<style scoped>
</style>
