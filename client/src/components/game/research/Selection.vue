<template>
 <form @submit.prevent v-if="player">
    <div class="form-group row mb-0 bg-primary">
        <label class="col col-form-label">Total Science:</label>
        <div class="col text-right">
            <label class="col-form-label">{{player.stats.totalScience}} <i class="fas fa-flask"></i></label>
        </div>
    </div>
    <div class="form-group row pt-2 pb-2 mb-0 bg-secondary" v-if="!player.defeated">
        <label class="col-5 col-form-label">Researching:</label>
        <div class="col-7">
            <select class="form-control" v-model="player.researchingNow" v-on:change="updateResearchNow" v-if="!loadingNow" :disabled="$isHistoricalMode() || isGameFinished">
                <option v-for="option in optionsNow" v-bind:value="option.value" v-bind:key="option.value">
                    {{ option.text }}
                </option>
            </select>

            <label v-if="loadingNow" class="col-form-label">Loading...</label>
        </div>
    </div>
    <div class="form-group row mb-0 bg-primary" v-if="!player.defeated">
        <label class="col col-form-label" title="Current Research ETA">ETA:</label>
        <div class="col text-right">
            <label class="col-form-label">{{timeRemainingEta}}</label>
        </div>
    </div>
    <div class="form-group row pt-2 pb-2 mb-2 bg-secondary" v-if="!player.defeated">
        <label class="col-5 col-form-label">Next:</label>
        <div class="col-7">
            <select class="form-control" v-model="player.researchingNext" v-on:change="updateResearchNext" v-if="!loadingNext" :disabled="$isHistoricalMode() || isGameFinished">
                <option v-for="option in optionsNext" v-bind:value="option.value" v-bind:key="option.value">
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
import AudioService from '../../../game/audio'

export default {
  data: function () {
    return {
      audio: null,
      loadingNow: false,
      loadingNext: false,
      optionsNow: [],
      optionsNext: [],
      timeRemainingEta: null,
      intervalFunction: null
    }
  },
  mounted () {
    this.loadTechnologies()

    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
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

      this.optionsNow = options.filter(o => TechnologyHelper.isTechnologyEnabled(this.$store.state.game, o.value) 
                                          && TechnologyHelper.isTechnologyResearchable(this.$store.state.game, o.value))
      this.optionsNext = options.filter(o => TechnologyHelper.isTechnologyEnabled(this.$store.state.game, o.value)
                                          && TechnologyHelper.isTechnologyResearchable(this.$store.state.game, o.value))

      this.optionsNext.push({ text: 'Random', value: 'random' })
    },
    async updateResearchNow (e) {
      this.loadingNow = true

      try {
        let result = await researchService.updateResearchNow(this.$store.state.game._id, this.player.researchingNow)

        if (result.status === 200) {
          AudioService.join()
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
          AudioService.join()
          this.$toasted.show(`Next research updated.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.loadingNext = false
    },
    recalculateTimeRemaining () {
      this.timeRemainingEta = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.player.currentResearchTicksEta)
    }
  },
  computed: {
    player: function () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
