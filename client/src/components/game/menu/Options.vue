<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="Options" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="!settings"/>

    <form @submit.prevent="handleSubmit" v-if="settings" class="pb-2">
      <h4 class="pt-2">Interface</h4>
      
      <div class="row bg-secondary pt-1 pb-1">
        <label for="uiStyle" class="col col-form-label">UI Style (Experimental)</label>
        <div class="col">
          <select class="form-control" id="uiStyle" v-model="settings.interface.uiStyle" :disabled="isSavingSettings">
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
          </select>
        </div>
      </div>
      
      <div class="row bg-secondary pt-1 pb-1">
        <label for="audio" class="col col-form-label">Audio</label>
        <div class="col">
          <select class="form-control" id="audio" v-model="settings.interface.audio" :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row bg-secondary pt-1 pb-1">
        <label for="galaxyScreenUpgrades" class="col col-form-label">Galaxy Screen</label>
        <div class="col">
          <select class="form-control" id="galaxyScreenUpgrades" v-model="settings.interface.galaxyScreenUpgrades" :disabled="isSavingSettings">
            <option value="enabled">Allow Upgrades</option>
            <option value="disabled">No Upgrades</option>
          </select>
        </div>
      </div>
      
      <div class="row bg-secondary pt-1 pb-1">
        <label for="drawPlanets" class="col col-form-label">Draw Planets</label>
        <div class="col">
          <select class="form-control" id="drawPlanets" v-model="settings.interface.drawPlanets" :disabled="isSavingSettings">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <h4 class="pt-2">Carriers</h4>

      <div class="row bg-secondary pt-1 pb-1">
        <label for="carrierDefaultAction" class="col col-form-label">Default Action</label>
        <div class="col">
          <select class="form-control" id="carrierDefaultAction" v-model="settings.carrier.defaultAction" :disabled="isSavingSettings">
            <option value="nothing">Do Nothing</option>
            <option value="collectAll">Collect All</option>
            <option value="dropAll">Drop All</option>
            <option value="collect">Collect</option>
            <option value="drop">Drop</option>
            <option value="collectAllBut">Collect All But</option>
            <option value="dropAllBut">Drop All But</option>
            <option value="garrison">Garrison</option>
          </select>
        </div>
      </div>
      
      <div class="row bg-secondary pt-1 pb-1">
        <label for="carrierDefaultAmount" class="col col-form-label">Default Amount</label>
        <div class="col">
          <input type="number" class="form-control" id="carrierDefaultAmount" v-model="settings.carrier.defaultAmount" :disabled="isSavingSettings">
        </div>
      </div>

      <form-error-list v-bind:errors="errors"/>

      <div class="row mt-2">
        <div class="col"></div>
        <div class="col-auto">
          <button type="submit" class="btn btn-success" :disabled="isSavingSettings"><i class="fas fa-save"></i> Save Settings</button>
        </div>
      </div>
    </form>
  </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import LoadingSpinnerVue from '../../LoadingSpinner'
import FormErrorList from '../../FormErrorList'
import UserApiService from '../../../services/api/user'
import GameContainer from '../../../game/container'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'form-error-list': FormErrorList
  },
  data () {
    return {
      isSavingSettings: false,
      errors: [],
      settings: null
    }
  },
  async mounted () {
    this.settings = null

    try {
      let response = await UserApiService.getGameSettings()

      if (response.status === 200) {
        this.settings = response.data
      }
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    async handleSubmit (e) {
      this.errors = []

      if (this.settings.carrier.defaultAmount < 0) {
        this.settings.carrier.defaultAmount = 0
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        this.isSavingSettings = true

        let response = await UserApiService.saveGameSettings(this.settings)

        if (response.status === 200) {
          this.$toasted.show(`Settings saved.`, { type: 'success' })
          
          this.$store.commit('setSettings', this.settings)

          GameContainer.reloadGame(this.$store.state.game, this.$store.state.settings)
          
          this.onCloseRequested()
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }

      this.isSavingSettings = false
    }
  }
}
</script>

<style scoped>
</style>
