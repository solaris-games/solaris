<template>
  <view-container>
    <view-title title="Create Game" />
    <view-subtitle title="Game Settings"/>

    <loading-spinner :loading="!settings"/>

    <form @submit.prevent="handleSubmit" v-if="settings">
      <div class="form-group">
        <label for="name" class="col-form-label">Name</label>
        <input type="text" required="required" class="form-control" id="name" minlength="3" maxlength="24" v-model="settings.general.name" :disabled="isCreatingGame">
      </div>

      <div class="form-group">
        <label for="description" class="col-form-label">Description</label>
        <textarea rows="4" class="form-control" id="description" v-model="settings.general.description"></textarea>
      </div>

      <div class="form-group">
        <label for="password" class="col-form-label">Password</label>
        <input type="password" class="form-control" id="password" v-model="settings.general.password" :disabled="isCreatingGame">
      </div>

      <div class="form-group">
        <label for="starsForVictory" class="col-form-label">Stars For Victory</label>
        <select class="form-control" id="starsForVictory" v-model="settings.general.starVictoryPercentage" :disabled="isCreatingGame">
          <option v-for="opt in options.general.starVictoryPercentage" v-bind:key="opt" v-bind:value="opt">
            {{ opt }}% of all Stars
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="players" class="col-form-label">Players</label>
        <select class="form-control" id="players" v-model="settings.general.playerLimit" :disabled="isCreatingGame">
          <option v-for="opt in options.general.playerLimit" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Players
          </option>
        </select>
      </div>

      <!-- <div class="form-group">
        <label for="playerType" class="col-form-label">Player Type</label>
        <select class="form-control" id="playerType" v-model="settings.general.playerType" :disabled="isCreatingGame">
          <option v-for="opt in options.general.playerType" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div> -->

      <form-error-list v-bind:errors="errors"/>

      <button type="submit" class="btn btn-success btn-lg mb-3 btn-block" :disabled="isCreatingGame">Create Game</button>

      <loading-spinner :loading="isCreatingGame"/>

      <view-subtitle title="Galaxy Settings"/>

      <div class="form-group">
        <label for="starsPerPlayer" class="col-form-label">Stars per Player</label>
        <select class="form-control" id="starsPerPlayer" v-model="settings.galaxy.starsPerPlayer" :disabled="isCreatingGame">
          <option v-for="opt in options.galaxy.starsPerPlayer" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="productionTicks" class="col-form-label">Production Ticks</label>
        <select class="form-control" id="productionTicks" v-model="settings.galaxy.productionTicks" :disabled="isCreatingGame">
          <option v-for="opt in options.galaxy.productionTicks" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Ticks
          </option>
        </select>
      </div>

      <view-subtitle title="Special Galaxy Settings"/>

      <div class="form-group">
        <label for="carrierCost" class="col-form-label">Carrier Cost</label>
        <select class="form-control" id="carrierCost" v-model="settings.specialGalaxy.carrierCost" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.carrierCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Carriers
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="warpgateCost" class="col-form-label">Warpgate Cost</label>
        <select class="form-control" id="warpgateCost" v-model="settings.specialGalaxy.warpgateCost" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.warpgateCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Gates
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="randomGates" class="col-form-label">Random Gates</label>
        <select class="form-control" id="randomGates" v-model="settings.specialGalaxy.randomGates" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.randomGates" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Gates
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="darkGalaxy" class="col-form-label">Dark Galaxy</label>
        <select class="form-control" id="darkGalaxy" v-model="settings.specialGalaxy.darkGalaxy" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.darkGalaxy" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <view-subtitle title="Player Settings"/>

      <div class="form-group">
        <label for="startingStars" class="col-form-label">Starting Stars</label>
        <select class="form-control" id="startingStars" v-model="settings.player.startingStars" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingStars" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Stars
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="startingCredits" class="col-form-label">Starting Credits</label>
        <select class="form-control" id="startingCredits" v-model="settings.player.startingCredits" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingCredits" v-bind:key="opt" v-bind:value="opt">
            ${{ opt }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="startingShips" class="col-form-label">Starting Ships</label>
        <select class="form-control" id="startingShips" v-model="settings.player.startingShips" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingShips" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Ships at each star
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Starting Infrastructure</label>
        <select class="form-control" id="startingInfrastructureEconomy" v-model="settings.player.startingInfrastructure.economy" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingInfrastructure.economy" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Economy
          </option>
        </select>
        <select class="form-control" id="startingInfrastructureIndustry" v-model="settings.player.startingInfrastructure.industry" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingInfrastructure.industry" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Industry
          </option>
        </select>
        <select class="form-control" id="startingInfrastructureScience" v-model="settings.player.startingInfrastructure.science" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingInfrastructure.science" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Science
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="economyCost" class="col-form-label">Development Cost</label>
        <select class="form-control" id="economyCost" v-model="settings.player.developmentCost.economy" :disabled="isCreatingGame">
          <option v-for="opt in options.player.developmentCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Economy
          </option>
        </select>
        <select class="form-control" id="industryCost" v-model="settings.player.developmentCost.industry" :disabled="isCreatingGame">
          <option v-for="opt in options.player.developmentCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Industry
          </option>
        </select>
        <select class="form-control" id="scienceCost" v-model="settings.player.developmentCost.science" :disabled="isCreatingGame">
          <option v-for="opt in options.player.developmentCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Science
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="tradeCost" class="col-form-label">Trade Cost</label>
        <select class="form-control" id="tradeCost" v-model="settings.player.tradeCost" :disabled="isCreatingGame">
          <option v-for="opt in options.player.tradeCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Trades ${{ opt.value}}/level
          </option>
        </select>
      </div>

      <!-- <div class="form-group">
        <label for="tradeScanning" class="col-form-label">Trade Scanning</label>
        <select class="form-control" id="tradeScanning" v-model="settings.player.tradeScanning" :disabled="isCreatingGame">
          <option v-for="opt in options.player.tradeScanning" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div> -->

      <view-subtitle title="Technology Settings"/>

      <div class="form-group">
        <label class="col-form-label">Starting Tech</label>
        <select class="form-control" id="startingTechLevelTerraforming" v-model="settings.technology.startingTechnologyLevel.terraforming" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Terraforming
          </option>
        </select>
        <select class="form-control" id="startingTechLevelExperimentation" v-model="settings.technology.startingTechnologyLevel.experimentation" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Experimentation
          </option>
        </select>
        <select class="form-control" id="startingTechLevelScanning" v-model="settings.technology.startingTechnologyLevel.scanning" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Scanning
          </option>
        </select>
        <select class="form-control" id="startingTechLevelHyperspace" v-model="settings.technology.startingTechnologyLevel.hyperspace" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Hyperspace
          </option>
        </select>
        <select class="form-control" id="startingTechLevelManufacturing" v-model="settings.technology.startingTechnologyLevel.manufacturing" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Manufacturing
          </option>
        </select>
        <select class="form-control" id="startingTechLevelBanking" v-model="settings.technology.startingTechnologyLevel.banking" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Banking
          </option>
        </select>
        <select class="form-control" id="startingTechLevelWeapons" v-model="settings.technology.startingTechnologyLevel.weapons" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Weapons
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="col-form-label">Research Costs</label>
        <select class="form-control" id="researchCostsTechTerraforming" v-model="settings.technology.researchCosts.terraforming" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Terraforming Research
          </option>
        </select>
        <select class="form-control" id="researchCostsTechExperimentation" v-model="settings.technology.researchCosts.experimentation" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Experimentation Research
          </option>
        </select>
        <select class="form-control" id="researchCostsTechScanning" v-model="settings.technology.researchCosts.scanning" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Scanning Research
          </option>
        </select>
        <select class="form-control" id="researchCostsTechHyperspace" v-model="settings.technology.researchCosts.hyperspace" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Hyperspace Research
          </option>
        </select>
        <select class="form-control" id="researchCostsTechManufacturing" v-model="settings.technology.researchCosts.manufacturing" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Manufacturing Research
          </option>
        </select>
        <select class="form-control" id="researchCostsTechBanking" v-model="settings.technology.researchCosts.banking" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Banking Research
          </option>
        </select>
        <select class="form-control" id="researchCostsTechWeapons" v-model="settings.technology.researchCosts.weapons" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Weapons Research
          </option>
        </select>
      </div>

      <view-subtitle title="Game Time Settings"/>

      <div class="form-group">
        <label for="gameSpeed" class="col-form-label">Game Speed</label>
        <select class="form-control" id="gameSpeed" v-model="settings.gameTime.speed" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.speed" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="startDelay" class="col-form-label">Start Delay</label>
        <select class="form-control" id="startDelay" v-model="settings.gameTime.startDelay" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.startDelay" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

    </form>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import ViewSubtitle from '../components/ViewSubtitle'
import FormErrorList from '../components/FormErrorList'
import gameService from '../services/api/game'
import router from '../router'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle,
    'form-error-list': FormErrorList
  },
  data () {
    return {
      isCreatingGame: false,
      errors: [],
      settings: null,
      options: null
    }
  },
  async mounted () {
    try {
      let response = await gameService.getDefaultGameSettings()

      this.settings = response.data.settings
      this.options = response.data.options
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    async handleSubmit (e) {
      this.errors = []

      if (!this.settings.general.name) {
        this.errors.push('Game name required.')
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        this.isCreatingGame = true

        // Call the login API endpoint
        let response = await gameService.createGame(this.settings)

        if (response.status === 201) {
          this.$toasted.show(`The game ${this.settings.general.name} has been created.`, { type: 'success' })

          router.push({ name: 'game-detail', query: { id: response.data } })
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }

      this.isCreatingGame = false
    }
  }
}
</script>

<style scoped>
</style>
