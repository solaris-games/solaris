<template>
  <div class="container">
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
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="randomGates" class="col-sm-2 col-form-label">Random Gates</label>
        <div class="col-sm-10">
          <select class="form-control" id="randomGates" v-model="settings.specialGalaxy.randomGates">
            <option v-for="opt in options.specialGalaxy.randomGates" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
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
        <label for="startingInfrastructureEconomy" class="col-sm-2 col-form-label">Starting Economy</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingInfrastructureEconomy" v-model="settings.player.startingInfrastructure.economy">
            <option v-for="opt in options.player.startingInfrastructure.economy" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Economy
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="startingInfrastructureIndustry" class="col-sm-2 col-form-label">Starting Industry</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingInfrastructureIndustry" v-model="settings.player.startingInfrastructure.industry">
            <option v-for="opt in options.player.startingInfrastructure.industry" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Industry
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="startingInfrastructureScience" class="col-sm-2 col-form-label">Starting Science</label>
        <div class="col-sm-10">
          <select class="form-control" id="startingInfrastructureScience" v-model="settings.player.startingInfrastructure.science">
            <option v-for="opt in options.player.startingInfrastructure.science" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Science
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="economyCost" class="col-sm-2 col-form-label">Economy Cost</label>
        <div class="col-sm-10">
          <select class="form-control" id="economyCost" v-model="settings.player.developmentCost.economy">
            <option v-for="opt in options.player.developmentCost.economy" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Economy
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="industryCost" class="col-sm-2 col-form-label">Industry Cost</label>
        <div class="col-sm-10">
          <select class="form-control" id="industryCost" v-model="settings.player.developmentCost.industry">
            <option v-for="opt in options.player.developmentCost.industry" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Industry
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="scienceCost" class="col-sm-2 col-form-label">Science Cost</label>
        <div class="col-sm-10">
          <select class="form-control" id="scienceCost" v-model="settings.player.developmentCost.science">
            <option v-for="opt in options.player.developmentCost.science" v-bind:key="opt.value" v-bind:value="opt.value">
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
      
    </form>
  </div>
</template>

<script>
import ViewTitle from "../components/ViewTitle";

export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
    return {
      settings: {
        general: {
          name: null,
          description: null,
          password: null,
          starsForVictoryPercentage: 50,
          playerCount: 8,
          playerType: 0,
          formalAlliances: 0,
          anonymity: 0
        },
        specialGalaxy: {
          buildWarpgates: 1,
          randomGates: 0,
          darkGalaxy: 2
        },
        galaxy: {
          galaxyType: 0,
          starScatter: 0,
          starsPerPlayer: 24,
          startingDistance: 0,
          resources: 1,
          productionTicks: 24
        },
        player: {
          startingStars: 6,
          startingCash: 500,
          startingShips: 10,
          startingInfrastructure: {
            economy: 5,
            industry: 5,
            science: 1
          },
          developmentCost: {
            economy: 1,
            industry: 1,
            science: 1
          },
          tradeCost: 15,
          tradeScanning: 0
        },
        technology: {
          startingTechnologyLevel: {
            terraforming: 1,
            experimentation: 1,
            scanning: 1,
            hyperspace: 1,
            manufacturing: 1,
            banking: 1,
            weapons: 1
          },
          researchCosts: {
            terraforming: 2,
            experimentation: 2,
            scanning: 2,
            hyperspace: 2,
            manufacturing: 2,
            banking: 2,
            weapons: 2
          }
        }
      },
      options: {
        general: {
          starsForVictoryPercentage: [25, 33, 50, 66],
          playerCount: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
          playerType: [
            { value: 0, text: 'All Players' },
            { value: 1, text: 'Premium Players Only' }
          ],
          formalAlliances: [
            { value: 0, text: 'No Formal Alliances' },
            { value: 1, text: 'Formal Alliances Enabled' }
          ],
          anonymity: [
            { value: 0, text: 'Normal' },
            { value: 1, text: 'Extra' }
          ]
        },
        specialGalaxy: {
          buildWarpgates: [
            { value: 0, text: 'Disabled' },
            { value: 1, text: 'Cheap Gates' },
            { value: 2, text: 'Expensive Gates' }
          ],
          randomGates: [
            { value: 0, text: 'No Random Gates' },
            { value: 1, text: 'Rare Gates' },
            { value: 2, text: 'Common Gates' }
          ],
          darkGalaxy: [
            { value: 0, text: 'Disabled' },
            { value: 1, text: 'Enabled' },
            { value: 2, text: 'Dark Start Only' }
          ],
        },
        galaxy: {
          galaxyType: [
            { value: 0, text: 'Random Hex' },
            { value: 1, text: 'Circular' },
            { value: 2, text: 'Custom' }
          ],
          starScatter: [
            { value: 0, text: 'Random Scatter' },
            { value: 1, text: 'Twin Rings (Symmetrical)' }
          ],
          starsPerPlayer: [
            { value: 8, text: '8 Stars (Tiny)' },
            { value: 16, text: '16 Stars (Small)' },
            { value: 24, text: '24 Stars (Medium)' },
            { value: 32, text: '32 Stars (Large)' }
          ],
          startingDistance: [
            { value: 0, text: 'Close' },
            { value: 1, text: 'Medium' },
            { value: 2, text: 'Far' }
          ],
          resources: [
            { value: 0, text: 'Sparse' },
            { value: 1, text: 'Standard' },
            { value: 2, text: 'Plentiful' }
          ],
          productionTicks: [ 16,18,20,22,24,26,28,30,32,34,36 ],
        },
        player: {
          startingStars: [ 1,2,3,4,5,6,7,8,9,10 ],
          startingCash: [ 25,500,1000,1500,2000,2500,3000 ],
          startingShips: [ 0,10,50,100 ],
          startingInfrastructure: {
            economy: [ 0,5,10,20,30 ],
            industry: [ 0,5,10,20,30 ],
            science: [ 0,1,2,3,4,5 ],
          },
          developmentCost: {
            economy: [
              { value: 0, text: 'Cheap' },
              { value: 1, text: 'Standard' },
              { value: 2, text: 'Expensive' }
            ],
            industry: [
              { value: 0, text: 'Cheap' },
              { value: 1, text: 'Standard' },
              { value: 2, text: 'Expensive' }
            ],
            science: [
              { value: 0, text: 'Cheap' },
              { value: 1, text: 'Standard' },
              { value: 2, text: 'Expensive' }
            ],
          },
          tradeCost: [
            { value: 5, text: 'Cheap' },
            { value: 15, text: 'Standard' },
            { value: 25, text: 'Expensive' },
            { value: 50, text: 'Very Expensive' }
          ],
          tradeScanning: [
            { value: 0, text: 'Trade with all players' },
            { value: 1, text: 'Trade with scanned players only' }
          ]
        },
        technology: {
          startingTechnologyLevel: [ 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 ],
          researchCosts: [
            { value: 0, text: 'No' },
            { value: 1, text: 'Cheap' },
            { value: 2, text: 'Normal' },
            { value: 3, text: 'Expensive' },
            { value: 4, text: 'Very Expensive' },
            { value: 5, text: 'Crazy Expensive' },
          ]
        }
      }
    };
  }
};
</script>

<style scoped>
</style>
