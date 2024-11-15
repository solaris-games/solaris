<template>
 <form @submit.prevent v-if="player">
    <div class="mb-2 row mb-0 bg-info">
        <label class="col col-form-label">Total Science:</label>
        <div class="col text-end">
            <label class="col-form-label">{{player.stats.totalScience}} <i class="fas fa-flask"></i></label>
        </div>
    </div>
    <div class="mb-2 row pt-2 pb-2 mb-0 " v-if="!player.defeated && optionsNow.length">
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
    <div class="mb-2 row mb-0 bg-dark" v-if="!player.defeated && optionsNow.length">
        <label class="col col-form-label" title="Current research ETA">ETA:</label>
        <div class="col text-end">
            <label class="col-form-label">{{timeRemainingEta}}</label>
        </div>
    </div>
    <div class="mb-2 row pt-2 pb-2 mb-0  mt-1" v-if="!player.defeated && optionsNext.length > 1">
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
    <div class="mb-2 row mb-2 bg-dark" v-if="!player.defeated && optionsNext.length > 1 && timeNextRemainingEta">
        <label class="col col-form-label" title="Next research ETA">ETA:</label>
        <div class="col text-end">
            <label class="col-form-label">{{timeNextRemainingEta}}</label>
        </div>
    </div>
</form>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import TechnologyHelper from '../../../../services/technologyHelper'
import researchService from '../../../../services/api/research'
import AudioService from '../../../../game/audio'

export default {
  data: function () {
    return {
      audio: null,
      loadingNow: false,
      loadingNext: false,
      optionsNow: [],
      optionsNext: [],
      timeRemainingEta: null,
      timeNextRemainingEta: null,
      intervalFunction: null
    }
  },
  mounted () {
    this.loadTechnologies()

    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 1000)
      this.recalculateTimeRemaining()
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
        { text: 'Manufacturing', value: 'manufacturing' },
        { text: 'Specialists', value: 'specialists' }
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
        let response = await researchService.updateResearchNow(this.$store.state.game._id, this.player.researchingNow)

        if (response.status === 200) {
          AudioService.join()
          this.player.currentResearchTicksEta = response.data.ticksEta
          this.player.nextResearchTicksEta = response.data.ticksNextEta
          this.recalculateTimeRemaining()
          this.$toast.default(`Current research updated.`)
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
          this.player.currentResearchTicksEta = response.data.ticksEta
          this.player.nextResearchTicksEta = response.data.ticksNextEta
          this.recalculateTimeRemaining()
          this.$toast.default(`Next research updated.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.loadingNext = false
    },
    recalculateTimeRemaining () {
      this.timeRemainingEta = GameHelper.getCountdownTimeStringByTicksWithTickETA(this.$store.state.game, this.player.currentResearchTicksEta)

      if (this.player.nextResearchTicksEta == null) {
        this.timeNextRemainingEta = null
      } else {
        this.timeNextRemainingEta = GameHelper.getCountdownTimeStringByTicksWithTickETA(this.$store.state.game, this.player.nextResearchTicksEta)
      }
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
