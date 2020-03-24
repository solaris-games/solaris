<template>
 <form @submit.prevent v-if="player">
    <div class="form-group row mb-2 bg-primary">
        <label class="col col-form-label">Total Science:</label>
        <div class="col text-right">
            <label class="col-form-label">0</label>
        </div>
    </div>
    <div class="form-group row mb-2">
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
    <div class="form-group row mb-2 bg-primary">
        <label class="col col-form-label">Current Research ETA:</label>
        <div class="col text-right">
            <label class="col-form-label">0d 0h 0m 0s</label>
        </div>
    </div>
    <div class="form-group row mb-2">
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
import ApiService from '../../../services/apiService'

export default {
  props: {
    game: Object
  },
  data: function () {
    return {
      loadingNow: false,
      loadingNext: false,
      player: null,
      options: [
        { text: 'Scanning', value: 'scanning' },
        { text: 'Hyperspace Range', value: 'hyperspaceRange' },
        { text: 'Terraforming', value: 'terraforming' },
        { text: 'Experimentation', value: 'experimentation' },
        { text: 'Weapons', value: 'weapons' },
        { text: 'Banking', value: 'banking' },
        { text: 'Manufacturing', value: 'manufacturing' }
      ]
    }
  },
  mounted () {
    this.player = GameHelper.getUserPlayer(this.game, this.$store.state.userId)
  },
  methods: {
    async updateResearchNow (e) {
      this.loadingNow = true

      try {
        await ApiService.updateResearchNow(this.game._id, this.player.researchingNow)
      } catch (err) {
        console.error(err)
      }

      this.loadingNow = false
    },
    async updateResearchNext (e) {
      this.loadingNext = true

      try {
        await ApiService.updateResearchNext(this.game._id, this.player.researchingNext)
      } catch (err) {
        console.error(err)
      }

      this.loadingNext = false
    }
  }
}
</script>

<style scoped>
</style>
