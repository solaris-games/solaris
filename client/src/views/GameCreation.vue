<template>
  <div class="container bg-light">
    <view-title title="Create Game" />

    <form>
      <h4>Game Settings</h4>

      <div class="form-group row">
        <label for="name" class="col-sm-2 col-form-label">Name</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="name" v-model="settings.general.name">
        </div>
      </div>

      <div class="form-group row">
        <label for="description" class="col-sm-2 col-form-label">Description</label>
        <div class="col-sm-10">
          <textarea rows="4" class="form-control" id="description" v-model="settings.general.description"></textarea>
        </div>
      </div>

      <div class="form-group row">
        <label for="password" class="col-sm-2 col-form-label">Password</label>
        <div class="col-sm-10">
          <input type="password" class="form-control" id="password" v-model="settings.general.password">
        </div>
      </div>

      <div class="form-group row">
        <label for="starsForVictory" class="col-sm-2 col-form-label">Stars For Victory</label>
        <div class="col-sm-10">
          <select class="form-control" id="starsForVictory" v-model="settings.general.starsForVictoryPercentage">
            <option v-for="opt in options.general.starsForVictoryPercentage" v-bind:key="opt" v-bind:value="opt">
              {{ opt }}% of all Stars
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="players" class="col-sm-2 col-form-label">Players</label>
        <div class="col-sm-10">
          <select class="form-control" id="players" v-model="settings.general.playerCount">
            <option v-for="opt in options.general.playerCount" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Players
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="playerType" class="col-sm-2 col-form-label">Player Type</label>
        <div class="col-sm-10">
          <select class="form-control" id="playerType" v-model="settings.general.playerType">
            <option v-for="opt in options.general.playerType" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="formalAlliances" class="col-sm-2 col-form-label">Formal Alliances</label>
        <div class="col-sm-10">
          <select class="form-control" id="formalAlliances" v-model="settings.general.formalAlliances">
            <option v-for="opt in options.general.formalAlliances" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="anonymity" class="col-sm-2 col-form-label">Anonymity</label>
        <div class="col-sm-10">
          <select class="form-control" id="anonymity" v-model="settings.general.anonymity">
            <option v-for="opt in options.general.anonymity" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <h4>Special Galaxy Settings</h4>

      <div class="form-group row">
        <label for="buildWarpgates" class="col-sm-2 col-form-label">Build Warpgates</label>
        <div class="col-sm-10">
          <select class="form-control" id="buildWarpgates" v-model="settings.specialGalaxy.buildWarpgates">
            <option v-for="opt in options.specialGalaxy.buildWarpgates" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Gates
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="randomGates" class="col-sm-2 col-form-label">Random Gates</label>
        <div class="col-sm-10">
          <select class="form-control" id="randomGates" v-model="settings.specialGalaxy.randomGates">
            <option v-for="opt in options.specialGalaxy.randomGates" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Gates
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="darkGalaxy" class="col-sm-2 col-form-label">Dark Galaxy</label>
        <div class="col-sm-10">
          <select class="form-control" id="darkGalaxy" v-model="settings.specialGalaxy.darkGalaxy">
            <option v-for="opt in options.specialGalaxy.darkGalaxy" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <h4>Galaxy </h4>

      <div class="form-group row">
        <label for="galaxyType" class="col-sm-2 col-form-label">Galaxy Type</label>
        <div class="col-sm-10">
          <select class="form-control" id="galaxyType" v-model="settings.galaxy.galaxyType">
            <option v-for="opt in options.galaxy.galaxyType" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="starScatter" class="col-sm-2 col-form-label">Star Scatter</label>
        <div class="col-sm-10">
          <select class="form-control" id="starScatter" v-model="settings.galaxy.starScatter">
            <option v-for="opt in options.galaxy.starScatter" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="starsPerPlayer" class="col-sm-2 col-form-label">Stars per Player</label>
        <div class="col-sm-10">
          <select class="form-control" id="starsPerPlayer" v-model="settings.galaxy.starsPerPlayer">
            <option v-for="opt in options.galaxy.starsPerPlayer" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="startingDistance" class="col-sm-2 col-form-label">Starting Distance</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingDistance" v-model="settings.galaxy.startingDistance">
            <option v-for="opt in options.galaxy.startingDistance" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="resources" class="col-sm-2 col-form-label">Resources</label>
        <div class="col-sm-10">
          <select class="form-control" id="resources" v-model="settings.galaxy.resources">
            <option v-for="opt in options.galaxy.resources" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="productionTicks" class="col-sm-2 col-form-label">Production Ticks</label>
        <div class="col-sm-10">
          <select class="form-control" id="productionTicks" v-model="settings.galaxy.productionTicks">
            <option v-for="opt in options.galaxy.productionTicks" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Ticks
            </option>
          </select>
        </div>
      </div>

      <h4>Player Settings</h4>

      <div class="form-group row">
        <label for="startingStars" class="col-sm-2 col-form-label">Starting Stars</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingStars" v-model="settings.player.startingStars">
            <option v-for="opt in options.player.startingStars" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Stars
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="startingCash" class="col-sm-2 col-form-label">Starting Cash</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingCash" v-model="settings.player.startingCash">
            <option v-for="opt in options.player.startingCash" v-bind:key="opt" v-bind:value="opt">
              ${{ opt }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="startingShips" class="col-sm-2 col-form-label">Starting Ships</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingShips" v-model="settings.player.startingShips">
            <option v-for="opt in options.player.startingShips" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Ships at each star
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2">Starting Infrastructure</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingInfrastructureEconomy" v-model="settings.player.startingInfrastructure.economy">
            <option v-for="opt in options.player.startingInfrastructure.economy" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Economy
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingInfrastructureIndustry" v-model="settings.player.startingInfrastructure.industry">
            <option v-for="opt in options.player.startingInfrastructure.industry" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Industry
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingInfrastructureScience" v-model="settings.player.startingInfrastructure.science">
            <option v-for="opt in options.player.startingInfrastructure.science" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Science
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="economyCost" class="col-sm-2 col-form-label">Development Cost</label>
        <div class="col-sm-10">
          <select class="form-control" id="economyCost" v-model="settings.player.developmentCost.economy">
            <option v-for="opt in options.player.developmentCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Economy
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="industryCost" v-model="settings.player.developmentCost.industry">
            <option v-for="opt in options.player.developmentCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Industry
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="scienceCost" v-model="settings.player.developmentCost.science">
            <option v-for="opt in options.player.developmentCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Science
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="tradeCost" class="col-sm-2 col-form-label">Trade Cost</label>
        <div class="col-sm-10">
          <select class="form-control" id="tradeCost" v-model="settings.player.tradeCost">
            <option v-for="opt in options.player.tradeCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Trades ${{ opt.value}}/level
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="tradeScanning" class="col-sm-2 col-form-label">Trade Scanning</label>
        <div class="col-sm-10">
          <select class="form-control" id="tradeScanning" v-model="settings.player.tradeScanning">
            <option v-for="opt in options.player.tradeScanning" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <h4>Technology Settings</h4>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Starting Tech</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingTechLevelTerraforming" v-model="settings.technology.startingTechnologyLevel.terraforming">
            <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
              Level {{ opt }} Terraforming
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingTechLevelExperimentation" v-model="settings.technology.startingTechnologyLevel.experimentation">
            <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
              Level {{ opt }} Experimentation
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingTechLevelScanning" v-model="settings.technology.startingTechnologyLevel.scanning">
            <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
              Level {{ opt }} Scanning
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingTechLevelHyperspace" v-model="settings.technology.startingTechnologyLevel.hyperspace">
            <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
              Level {{ opt }} Hyperspace
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingTechLevelManufacturing" v-model="settings.technology.startingTechnologyLevel.manufacturing">
            <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
              Level {{ opt }} Manufacturing
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingTechLevelBanking" v-model="settings.technology.startingTechnologyLevel.banking">
            <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
              Level {{ opt }} Banking
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="startingTechLevelWeapons" v-model="settings.technology.startingTechnologyLevel.weapons">
            <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
              Level {{ opt }} Weapons
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Research Costs</label>
        <div class="col-sm-10">
          <select class="form-control" id="researchCostsTechTerraforming" v-model="settings.technology.researchCosts.terraforming">
            <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Terraforming Research
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="researchCostsTechExperimentation" v-model="settings.technology.researchCosts.experimentation">
            <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Experimentation Research
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="researchCostsTechScanning" v-model="settings.technology.researchCosts.scanning">
            <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Scanning Research
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="researchCostsTechHyperspace" v-model="settings.technology.researchCosts.hyperspace">
            <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Hyperspace Research
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="researchCostsTechManufacturing" v-model="settings.technology.researchCosts.manufacturing">
            <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Manufacturing Research
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="researchCostsTechBanking" v-model="settings.technology.researchCosts.banking">
            <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Banking Research
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2"></label>
        <div class="col-sm-10">
          <select class="form-control" id="researchCostsTechWeapons" v-model="settings.technology.researchCosts.weapons">
            <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Weapons Research
            </option>
          </select>
        </div>
      </div>

      <h4>Game Time Settings</h4>

      <div class="form-group row">
        <label for="gameTime" class="col-sm-2 col-form-label">Game Time</label>
        <div class="col-sm-10">
          <select class="form-control" id="gameTime" v-model="settings.gameTime.time">
            <option v-for="opt in options.gameTime.time" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row" v-if="settings.gameTime.time === 0">
        <label for="gameSpeed" class="col-sm-2 col-form-label">Game Speed</label>
        <div class="col-sm-10">
          <select class="form-control" id="gameSpeed" v-model="settings.gameTime.speed">
            <option v-for="opt in options.gameTime.speed" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row" v-if="settings.gameTime.time === 1">
        <label for="turnJumps" class="col-sm-2 col-form-label">Turn Jumps</label>
        <div class="col-sm-10">
          <select class="form-control" id="turnJumps" v-model="settings.gameTime.turnJumps">
            <option v-for="opt in options.gameTime.turnJumps" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Tick Jumps
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row" v-if="settings.gameTime.time === 1">
        <label for="maxTurnWait" class="col-sm-2 col-form-label">Max Turn Wait</label>
        <div class="col-sm-10">
          <select class="form-control" id="maxTurnWait" v-model="settings.gameTime.maxTurnWait">
            <option v-for="opt in options.gameTime.maxTurnWait" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Hours
            </option>
          </select>
        </div>
      </div>
      
    </form>
  </div>
</template>

<script>
import ViewTitle from "../components/ViewTitle";
import apiService from '../services/apiService';

export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
    return {
      settings: null,
      options: null
    };
  },
  async mounted() {
    try {
      let response = await apiService.getDefaultGameSettings();

      this.settings = response.data.settings;
      this.options = response.data.options;
    } catch(err) {
      console.error(err);
    }
  }
};
</script>

<style scoped>
</style>
