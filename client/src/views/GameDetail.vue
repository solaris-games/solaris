<template>
  <view-container>
    <view-title title="Game Detail" navigation="main-menu"/>

    <loading-spinner :loading="isLoadingGame"/>

    <div v-if="!isLoadingGame">
      <view-subtitle v-bind:title="game.settings.general.name" class="mt-2"/>

      <p v-if="game.settings.general.description">{{game.settings.general.description}}</p>

      <div class="mb-4">
        <router-link to="/game/list" tag="button" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Return to List</router-link>
        <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success float-right">Open Game <i class="fas fa-arrow-right"></i> </router-link>
      </div>

      <view-subtitle title="General Settings"/>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Stars For Victory</td>
              <td class="text-right">{{ game.settings.general.starVictoryPercentage }}%</td>
            </tr>
            <tr>
              <td>Players</td>
              <td class="text-right">{{ game.settings.general.playerLimit }}</td>
            </tr>
            <!-- <tr>
              <td>Player Type</td>
              <td class="text-right">{{ getFriendlyText(game.settings.general.playerType) }}</td>
            </tr> -->
          </tbody>
        </table>
      </div>

      <view-subtitle title="Galaxy Settings"/>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Stars Per Player</td>
              <td class="text-right">{{ game.settings.galaxy.starsPerPlayer }}</td>
            </tr>
            <tr>
              <td>Production Ticks</td>
              <td class="text-right">{{ game.settings.galaxy.productionTicks }} ticks/cycle</td>
            </tr>
          </tbody>
        </table>
      </div>

      <view-subtitle title="Special Galaxy Settings"/>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Carrier Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.carrierCost) }}</td>
            </tr>
            <tr>
              <td>Warpgate Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.warpgateCost) }}</td>
            </tr>
            <tr>
              <td>Random Gates</td>
              <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomGates) }}</td>
            </tr>
            <tr>
              <td>Dark Galaxy</td>
              <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.darkGalaxy) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <view-subtitle title="Player Settings"/>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Starting Stars</td>
              <td class="text-right">{{ game.settings.player.startingStars }}</td>
            </tr>
            <tr>
              <td>Starting Credits</td>
              <td class="text-right">{{ game.settings.player.startingCredits }}</td>
            </tr>
            <tr>
              <td>Starting Ships</td>
              <td class="text-right">{{ game.settings.player.startingShips }}</td>
            </tr>
            <tr>
              <td>Starting Economy</td>
              <td class="text-right">{{ game.settings.player.startingInfrastructure.economy }}</td>
            </tr>
            <tr>
              <td>Starting Industry</td>
              <td class="text-right">{{ game.settings.player.startingInfrastructure.industry }}</td>
            </tr>
            <tr>
              <td>Starting Science</td>
              <td class="text-right">{{ game.settings.player.startingInfrastructure.science }}</td>
            </tr>
            <tr>
              <td>Economy Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.player.developmentCost.economy) }}</td>
            </tr>
            <tr>
              <td>Industry Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.player.developmentCost.industry) }}</td>
            </tr>
            <tr>
              <td>Science Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.player.developmentCost.science) }}</td>
            </tr>
            <tr>
              <td>Trade Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.player.tradeCost) }} credits/level</td>
            </tr>
            <!-- <tr>
              <td>Trade Scanning</td>
              <td class="text-right">{{ getFriendlyText(game.settings.player.tradeScanning) }}</td>
            </tr> -->
          </tbody>
        </table>
      </div>

      <view-subtitle title="Technology Settings"/>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Starting Terraforming Level</td>
              <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.terraforming }}</td>
            </tr>
            <tr>
              <td>Starting Experimentation Level</td>
              <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.experimentation }}</td>
            </tr>
            <tr>
              <td>Starting Scanning Level</td>
              <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.scanning }}</td>
            </tr>
            <tr>
              <td>Starting Hyperspace Level</td>
              <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.hyperspace }}</td>
            </tr>
            <tr>
              <td>Starting Manufacturing Level</td>
              <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.manufacturing }}</td>
            </tr>
            <tr>
              <td>Starting Banking Level</td>
              <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.banking }}</td>
            </tr>
            <tr>
              <td>Starting Weapons Level</td>
              <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.weapons }}</td>
            </tr>
            <tr>
              <td>Terraforming Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.terraforming) }}</td>
            </tr>
            <tr>
              <td>Experimentation Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.experimentation) }}</td>
            </tr>
            <tr>
              <td>Scanning Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.scanning) }}</td>
            </tr>
            <tr>
              <td>Hyperspace Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.hyperspace) }}</td>
            </tr>
            <tr>
              <td>Manufacturing Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.manufacturing) }}</td>
            </tr>
            <tr>
              <td>Banking Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.banking) }}</td>
            </tr>
            <tr>
              <td>Weapons Cost</td>
              <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.weapons) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <view-subtitle title="Game Time Settings"/>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Game Time</td>
              <td class="text-right">{{ game.settings.gameTime.speed }} minute(s)/tick</td>
            </tr>
            <tr>
              <td>Start Delay</td>
              <td class="text-right">{{ game.settings.gameTime.startDelay }} minutes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewTitle from '../components/ViewTitle'
import ViewSubtitle from '../components/ViewSubtitle'
import ViewContainer from '../components/ViewContainer'
import gameService from '../services/api/game'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle
  },
  data () {
    return {
      isLoadingGame: true,
      game: {
        _id: null,
        settings: {
          general: {
            name: null,
            description: null
          }
        }
      }
    }
  },
  created () {
    this.game._id = this.$route.query.id
  },
  async mounted () {
    this.isLoadingGame = true

    try {
      let response = await gameService.getGameInfo(this.game._id)

      this.game = response.data
    } catch (err) {
      console.error(err)
    }

    this.isLoadingGame = false
  },
  methods: {
    getFriendlyText (option) {
      return {
        'all': 'All',
        'premium': 'Premium',
        'cheap': 'Cheap',
        'standard': 'Standard',
        'expensive': 'Expensive',
        'veryExpensive': 'Very Expensive',
        'crazyExpensive': 'Crazy Expensive',
        'none': 'None',
        'rare': 'Rare',
        'common': 'Common',
        'disabled': 'Disabled',
        'enabled': 'Enabled',
        'start': 'Start Only',
        'scanned': 'Scanned Only'
      }[option]
    }
  }
}
</script>

<style scoped>
</style>
