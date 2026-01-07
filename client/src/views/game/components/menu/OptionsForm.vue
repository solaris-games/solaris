<template>
  <div>
    <loading-spinner :loading="!settings" />

    <form @submit.prevent="handleSubmit" v-if="settings" class="pb-2">
      <h5 class="pt-2">Interface</h5>

      <div class="row pt-1 pb-1">
        <label for="uiStyle" class="col-12 col-sm-6 col-form-label">UI Style</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="uiStyle" v-model="settings.interface.uiStyle" :disabled="isSavingSettings">
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="audio" class="col-12 col-sm-6 col-form-label">Audio</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="audio" v-model="settings.interface.audio" :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="suggestMentions" class="col-12 col-sm-6 col-form-label">Autofill chat mentions</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="suggestMentions" v-model="settings.interface.suggestMentions"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="shiftKeyMentions" class="col-12 col-sm-6 col-form-label">Only add mentions by clicking on objects when the shift key is pressed</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="shiftKeyMentions" v-model="settings.interface.shiftKeyMentions"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="galaxyScreenUpgrades" class="col-12 col-sm-6 col-form-label">Galaxy Screen</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="galaxyScreenUpgrades" v-model="settings.interface.galaxyScreenUpgrades"
            :disabled="isSavingSettings">
            <option value="enabled">Allow Upgrades</option>
            <option value="disabled">No Upgrades</option>
          </select>
        </div>
      </div>

      <h5 class="pt-2">Guild</h5>

      <div class="row pt-1 pb-1">
        <label for="displayGuildTag" class="col-12 col-sm-6 col-form-label">Display Guild Tag</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="displayGuildTag" v-model="settings.guild.displayGuildTag"
            :disabled="isSavingSettings">
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      <h5 class="pt-2">Map</h5>

      <div class="mb-1 pb-1">

        <div class="row pt-1 pb-1">
          <label for="territory-style" class="col-12 col-sm-6 col-form-label">Territory Style</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="territory-style" v-model="settings.map.territoryStyle"
              :disabled="isSavingSettings">
              <option value="marching-square">Marching Square</option>
              <option value="voronoi">Voronoi</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div v-if="settings.map.territoryStyle == 'marching-square'" class="row pt-1 pb-1 ms-1">
          <label for="territory-size" class="col-12 col-sm-6 col-form-label">Territory Size</label>
          <div class="col-12 col-sm-6">
            <input type="number" min="2" max="32" class="form-control" id="territory-size"
              v-model="settings.map.marchingSquareTerritorySize" :disabled="isSavingSettings">
          </div>
        </div>

        <div v-if="settings.map.territoryStyle == 'marching-square'" class="row pt-1 pb-1 ms-1">
          <label for="grid-size" class="col-12 col-sm-6 col-form-label">Grid Size</label>
          <div class="col-12 col-sm-6">
            <input type="number" min="2" max="32" class="form-control" id="grid-size"
              v-model="settings.map.marchingSquareGridSize" :disabled="isSavingSettings">
          </div>
        </div>

        <div v-if="settings.map.territoryStyle == 'marching-square'" class="row pt-1 pb-1 ms-1">
          <label for="border-width" class="col-12 col-sm-6 col-form-label">Border Width</label>
          <div class="col-12 col-sm-6">
            <input type="number" min="0" max="8" class="form-control" id="border-width"
              v-model="settings.map.marchingSquareBorderWidth" :disabled="isSavingSettings">
          </div>
        </div>

        <div v-if="settings.map.territoryStyle == 'voronoi'" class="row pt-1 pb-1 ms-1">
          <label for="grid-size" class="col-12 col-sm-6 col-form-label">Cell Border Width</label>
          <div class="col-12 col-sm-6">
            <input type="number" min="0" max="5" class="form-control" id="grid-size"
              v-model="settings.map.voronoiCellBorderWidth" :disabled="isSavingSettings">
          </div>
        </div>

        <div v-if="settings.map.territoryStyle == 'voronoi'" class="row pt-1 pb-1 ms-1">
          <label for="grid-size" class="col-12 col-sm-6 col-form-label">Territory Border Width</label>
          <div class="col-12 col-sm-6">
            <input type="number" min="0" max="8" class="form-control" id="grid-size"
              v-model="settings.map.voronoiTerritoryBorderWidth" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row mb-1 pb-1">
          <label for="territory-opacity" class="col col-form-label">Territory Opacity</label>
          <div class="col">
            <input type="number" max="1" min="0" step="0.05" class="form-control" id="territory-opacity"
              v-model="settings.map.territoryOpacity" :disabled="isSavingSettings">
          </div>
        </div>
      </div>

      <div class="mb-1 pb-1">

        <div class="row pt-1 pb-1">
          <label for="objects-scaling" class="col-12 col-sm-6 col-form-label">Object Scaling</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="objects-scaling" v-model="settings.map.objectsScaling"
              :disabled="isSavingSettings">
              <option value="default">Default</option>
              <option value="clamped">Clamped</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="objects-depth" class="col-12 col-sm-6 col-form-label">Object Depth</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="objects-depth" v-model="settings.map.objectsDepth"
              :disabled="isSavingSettings">
              <option value="disabled">Disabled</option>
              <option value="enabled">Enabled</option>
            </select>
          </div>
        </div>

        <div v-if="settings.map.objectsScaling == 'clamped'" class="row pt-1 pb-1 ms-1">
          <label for="minimum-scale" class="col-12 col-sm-6 col-form-label">Minimum Scale</label>
          <div class="col-12 col-sm-6">
            <input type="number" min="0" max="32" class="form-control" id="minimum-scale"
              v-model="settings.map.objectsMinimumScale" :disabled="isSavingSettings">
          </div>
        </div>
        <div v-if="settings.map.objectsScaling == 'clamped'" class="row pt-1 pb-1 ms-1">
          <label for="maximum-scale" class="col-12 col-sm-6 col-form-label">Maximum Scale</label>
          <div class="col-12 col-sm-6">
            <input type="number" min="12" max="128" class="form-control" id="maximum-scale"
              v-model="settings.map.objectsMaximumScale" :disabled="isSavingSettings">
          </div>
        </div>

      </div>

      <div class="row pt-1 pb-1">
        <label for="" class="col col-form-label">Carrier Paths</label>
      </div>

      <div class="mb-1 pb-1">

        <div class="row pt-1 pb-1 ms-1">
          <label for="carrier-path-width" class="col col-form-label">Path Width</label>
          <div class="col">
            <input type="number" min="1" max="8" class="form-control" id="carrier-path-width"
              v-model="settings.map.carrierPathWidth" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="loop-style" class="col-12 col-sm-6 col-form-label">Loop Style</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="loop-style" v-model="settings.map.carrierLoopStyle"
              :disabled="isSavingSettings">
              <option value="dashed">Dashed</option>
              <option value="solid">Solid</option>
            </select>
          </div>
        </div>

        <div v-if="settings.map.carrierLoopStyle == 'dashed'" class="row pt-1 pb-1 ms-1">
          <label for="carrier-path-length" class="col col-form-label">Dash Length</label>
          <div class="col">
            <input type="number" min="4" max="16" class="form-control" id="carrier-path-length"
              v-model="settings.map.carrierPathDashLength" :disabled="isSavingSettings">
          </div>
        </div>

      </div>

      <div class="mb-1 pb-1">
        <div class="row pt-1 pb-1">
          <label for="naturalResources" class="col-12 col-sm-6 col-form-label">Natural Resources</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="naturalResources" v-model="settings.map.naturalResources"
              :disabled="isSavingSettings">
              <option value="planets">Planets</option>
              <option value="single-ring">Single Ring</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mb-1 pb-1">
        <div class="row pt-1 pb-1">
          <label for="" class="col col-form-label">Background</label>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="nebula-frequency" class="col col-form-label">Nebula Frequency</label>
          <div class="col">
            <input type="range" min="0" max="16" step="1" class="form-range w-100" id="nebula-frequency"
              v-model="settings.map.background.nebulaFrequency" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="nebula-density" class="col col-form-label">Nebula Density</label>
          <div class="col">
            <input type="range" min="0" max="8" step="1" class="form-range w-100" id="nebula-density"
              v-model="settings.map.background.nebulaDensity" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="nebula-opacity" class="col col-form-label">Nebula Opacity</label>
          <div class="col">
            <input type="range" min="0.0" max="1.0" step="0.0625" class="form-range w-100" id="nebula-opacity"
              v-model="settings.map.background.nebulaOpacity" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="stars-opacity" class="col col-form-label">Stars Opacity</label>
          <div class="col">
            <input type="range" min="0.0" max="1.0" step="0.0625" class="form-range w-100" id="stars-opacity"
              v-model="settings.map.background.starsOpacity" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="background-blend-mode" class="col-12 col-sm-6 col-form-label">Blend Mode</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="background-blend-mode" v-model="settings.map.background.blendMode"
              :disabled="isSavingSettings">
              <option value="ADD">Vibrant</option>
              <option value="NORMAL">Soft</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="moving-nebulas" class="col-12 col-sm-6 col-form-label">Moving Nebulas</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="moving-nebulas" v-model="settings.map.background.moveNebulas"
              :disabled="isSavingSettings">
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div v-if="settings.map.background.moveNebulas == 'enabled'" class="ms-3">
          <div class="row pt-1 pb-1 ms-1">
            <label for="nebula-speed" class="col col-form-label">Nebula Speed</label>
            <div class="col">
              <input type="range" min="0.0" max="2.0" step="0.125" class="form-range w-100" id="nebula-speed"
                v-model="settings.map.background.nebulaMovementSpeed" :disabled="isSavingSettings">
            </div>
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="nebula-colour-1" class="col-12 col-sm-6 col-form-label">Nebula Colour 1</label>
          <div class="col-12 col-sm-6">
            <input type="text" class="form-control" id="nebula-colour-1" v-model="settings.map.background.nebulaColour1"
              :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="nebula-colour-2" class="col-12 col-sm-6 col-form-label">Nebula Colour 2</label>
          <div class="col-12 col-sm-6">
            <input type="text" class="form-control" id="nebula-colour-2" v-model="settings.map.background.nebulaColour2"
              :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="nebula-colour-3" class="col-12 col-sm-6 col-form-label">Nebula Colour 3</label>
          <div class="col-12 col-sm-6">
            <input type="text" class="form-control" id="nebula-colour-3" v-model="settings.map.background.nebulaColour3"
              :disabled="isSavingSettings">
          </div>
        </div>

      </div>

      <div class="mb-1 pb-1">
        <h6>Map Feature Distance (%)</h6>

        <div class="row pt-1 pb-1">
          <label for="" class="col col-form-label">Zoomed-Out Features</label>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="territories-zoom" class="col col-form-label">Territories</label>
          <div class="col">
            <input type="number" class="form-control" id="territories-zoom"
              v-model="settings.map.zoomLevels.territories" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="player-names-zoom" class="col col-form-label">Player Names</label>
          <div class="col">
            <input type="number" class="form-control" id="player-names-zoom"
              v-model="settings.map.zoomLevels.playerNames" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="" class="col col-form-label">Zoomed-In Features</label>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="nebulas-zoom" class="col col-form-label">Nebulas</label>
          <div class="col">
            <input type="number" class="form-control" id="nebulas-zoom"
              v-model="settings.map.zoomLevels.background.nebulas" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="background-stars-zoom" class="col col-form-label">Background Stars</label>
          <div class="col">
            <input type="number" class="form-control" id="background-stars-zoom"
              v-model="settings.map.zoomLevels.background.stars" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="carriers-ship-zoom" class="col col-form-label">Carrier Ships</label>
          <div class="col">
            <input type="number" class="form-control" id="carriers-ship-zoom"
              v-model="settings.map.zoomLevels.carrierShips" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="star-ship-zoom" class="col col-form-label">Star Ships</label>
          <div class="col">
            <input type="number" class="form-control" id="star-ship-zoom"
              v-model="settings.map.zoomLevels.star.shipCount" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="star-name-zoom" class="col col-form-label">Star Name</label>
          <div class="col">
            <input type="number" class="form-control" id="star-name-zoom" v-model="settings.map.zoomLevels.star.name"
              :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="star-resources-zoom" class="col col-form-label">Star Natural Resources</label>
          <div class="col">
            <input type="number" class="form-control" id="star-resources-zoom"
              v-model="settings.map.zoomLevels.star.naturalResources" :disabled="isSavingSettings">
          </div>
        </div>

        <div class="row pt-1 pb-1 ms-1">
          <label for="star-infrastructure-zoom" class="col col-form-label">Star Infrastructure</label>
          <div class="col">
            <input type="number" class="form-control" id="star-infrastructure-zoom"
              v-model="settings.map.zoomLevels.star.infrastructure" :disabled="isSavingSettings">
          </div>
        </div>
      </div>

      <div class="mb-1 pb-1">
        <div class="row pt-1 pb-1">
          <label for="antiAliasing" class="col-12 col-sm-6 col-form-label">Anti Aliasing</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="antiAliasing" v-model="settings.map.antiAliasing"
              :disabled="isSavingSettings">
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <div class="row mb-1 pb-1">
        <label for="natural-resources-ring-opacity" class="col col-form-label">Natural Resources Ring Opacity</label>
        <div class="col">
          <input type="number" max="1" min="0" step="0.05" class="form-control" id="natural-resources-ring-opacity"
            v-model="settings.map.naturalResourcesRingOpacity" :disabled="isSavingSettings">
        </div>
      </div>

      <div class="mb-1 pb-1">
        <div class="row pt-1 pb-1">
          <label for="galaxyCenterVisible" class="col-12 col-sm-6 col-form-label">Always show galaxy center indicator</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="galaxyCenterVisible" v-model="settings.map.galaxyCenterAlwaysVisible"
              :disabled="isSavingSettings">
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <h5 class="pt-2">Carriers</h5>

      <div class="row pt-1 pb-1">
        <label for="carrierDefaultAction" class="col-12 col-sm-6 col-form-label">Default Action</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="carrierDefaultAction" v-model="settings.carrier.defaultAction"
            :disabled="isSavingSettings">
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

      <div class="row pt-1 pb-1">
        <label for="carrierDefaultAmount" class="col-12 col-sm-6 col-form-label">Default Amount</label>
        <div class="col-12 col-sm-6">
          <input type="number" class="form-control" id="carrierDefaultAmount" v-model="settings.carrier.defaultAmount"
            :disabled="isSavingSettings">
        </div>
      </div>

      <h5 class="pt-2">Confirmations</h5>

      <div class="row pt-1 pb-1">
        <label for="confirmBuildCarrier" class="col-12 col-sm-6 col-form-label">Confirm Build Carrier</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="confirmBuildCarrier" v-model="settings.carrier.confirmBuildCarrier"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="confirmBuildEconomy" class="col-12 col-sm-6 col-form-label">Confirm Upgrade Economy</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="confirmBuildEconomy" v-model="settings.star.confirmBuildEconomy"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="confirmBuildIndustry" class="col-12 col-sm-6 col-form-label">Confirm Upgrade Industry</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="confirmBuildIndustry" v-model="settings.star.confirmBuildIndustry"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="confirmBuildScience" class="col-12 col-sm-6 col-form-label">Confirm Upgrade Science</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="confirmBuildScience" v-model="settings.star.confirmBuildScience"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="confirmBuildWarpGate" class="col-12 col-sm-6 col-form-label">Confirm Upgrade Warp Gate</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="confirmBuildWarpGate" v-model="settings.star.confirmBuildWarpGate"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="confirmShipDistribution" class="col-12 col-sm-6 col-form-label">Confirm Ship Distribution</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="confirmShipDistribution" v-model="settings.star.confirmShipDistribution"
                  :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <h5 class="pt-2">Technical</h5>

      <div class="row pt-1 pb-1">
        <label for="performanceMonitor" class="col-12 col-sm-6 col-form-label">Display Performance Monitor</label>
        <div class="col-12 col-sm-6">
          <select class="form-control" id="performanceMonitor" v-model="settings.technical.performanceMonitor"
            :disabled="isSavingSettings">
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
      </div>

      <div class="row pt-1 pb-1">
        <label for="fpsLimit" class="col-12 col-sm-6 col-form-label">FPS Limit</label>
        <div class="col-12 col-sm-6">
          <input class="form-control" min="0" max="240" type="number" id="fpsLimit"
            v-model="settings.technical.fpsLimit" :disabled="isSavingSettings">
        </div>
      </div>

      <form-error-list v-bind:errors="errors" />

      <div class="row mt-2">
        <div class="col">
          <button type="button" class="btn btn-warning" :disabled="isSavingSettings" @click="resetToDefaults">
            <i class="fas fa-arrow-rotate-left"></i> Reset to defaults
          </button>
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-success" :disabled="isSavingSettings">
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import FormErrorList from '../../../components/FormErrorList.vue'
import { inject, onMounted, ref, type Ref } from 'vue';
import { eventBusInjectionKey } from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import { extractErrors, formatError, httpInjectionKey, isOk, ResponseResultKind } from '@/services/typedapi';
import {DEFAULT_SETTINGS, type UserGameSettings} from '@solaris-common';
import { getSettings, saveSettings } from '@/services/typedapi/user';
import { toastInjectionKey } from '@/util/keys';
import { useStore, type Store } from 'vuex';
import { type State } from '@/store';

const props = defineProps<{
  isInGame: boolean,
}>();

const emit = defineEmits<{
  onOptionsSaved: [],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const isSavingSettings = ref(false);
const errors: Ref<string[]> = ref([]);
const settings: Ref<UserGameSettings | null> = ref(null);

const onOptionsSaved = () => {
  emit('onOptionsSaved');
};

const handleSubmit = async (e: Event) => {
  if (!settings.value) {
    return;
  }

  errors.value = []

  if (settings.value.carrier.defaultAmount < 0) {
    settings.value.carrier.defaultAmount = 0;
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  isSavingSettings.value = true;

  const response = await saveSettings(httpClient)(settings.value!);

  if (isOk(response)) {
    toast.success(`Settings saved.`);

    store.commit('setSettings', settings.value);

    if (props.isInGame) {
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadGame, { game: store.state.game, settings: store.state.settings });
    }

    onOptionsSaved();
  } else {
    console.error(response.cause);
    errors.value = extractErrors(response) || [];
  }

  isSavingSettings.value = false
};

const resetToDefaults = () => {
  settings.value = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
};

onMounted(async () => {
  settings.value = null

  const response = await getSettings(httpClient)();

  if (isOk(response)) {
    settings.value = response.data;
  } else {
    console.error(formatError(response));
  }
})
</script>

<style scoped></style>
