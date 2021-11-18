<template>
  <div>
    <view-subtitle title="General Settings"/>
    <div class="table-responsive" v-if="game">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Mode</td>
            <td class="text-right">{{ getFriendlyText(game.settings.general.mode) }}</td>
          </tr>
          <tr v-if="game.settings.general.mode === 'conquest'">
            <td>Victory Condition</td>
            <td class="text-right">{{ getFriendlyText(game.settings.conquest.victoryCondition) }}</td>
          </tr>
          <tr v-if="game.settings.general.mode === 'conquest'">
            <td>Stars For Victory</td>
            <td class="text-right">{{ game.settings.conquest.victoryPercentage }}%</td>
          </tr>
          <tr>
            <td>Players</td>
            <td class="text-right">{{ game.settings.general.playerLimit }}</td>
          </tr>
          <tr>
            <td>Player Type</td>
            <td class="text-right">{{ getFriendlyText(game.settings.general.playerType) }}</td>
          </tr>
          <tr>
            <td>Anonymity</td>
            <td class="text-right">{{ getFriendlyText(game.settings.general.anonymity) }}</td>
          </tr>
          <tr>
            <td>Player Online Status</td>
            <td class="text-right">{{ getFriendlyText(game.settings.general.playerOnlineStatus) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <view-subtitle title="Game Time Settings"/>
    <div class="table-responsive" v-if="game">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Game Type</td>
            <td class="text-right">{{ getFriendlyText(game.settings.gameTime.gameType) }}</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'realTime'">
            <td>Game Time</td>
            <td class="text-right" v-if="game.settings.gameTime.speed >= 60">{{ game.settings.gameTime.speed/60 }} minute(s)/tick</td>
            <td class="text-right" v-if="game.settings.gameTime.speed < 60">{{ game.settings.gameTime.speed }} second(s)/tick</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'realTime'">
            <td>Start Delay</td>
            <td class="text-right">{{ game.settings.gameTime.startDelay }} minutes</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'turnBased'">
            <td>Turn Jumps</td>
            <td class="text-right">{{ game.settings.gameTime.turnJumps }} tick jumps</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'turnBased'">
            <td>Max Turn Wait</td>
            <td class="text-right" v-if="game.settings.gameTime.maxTurnWait >= 60">{{ game.settings.gameTime.maxTurnWait/60 }} hour(s)</td>
            <td class="text-right" v-if="game.settings.gameTime.maxTurnWait < 60">{{ game.settings.gameTime.maxTurnWait }} minute(s)</td>
          </tr>
          <tr>
            <td>AFK Last Seen Limit</td>
            <td class="text-right">{{ game.settings.gameTime.afk.lastSeenTimeout }} day(s)</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'realTime'">
            <td>AFK Galactic Cycle Limit</td>
            <td class="text-right">{{ game.settings.gameTime.afk.cycleTimeout }} cycles</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'turnBased'">
            <td>AFK Missed Turn Limit</td>
            <td class="text-right">{{ game.settings.gameTime.afk.turnTimeout }} missed turns</td>
          </tr>
        </tbody>
      </table>
    </div>

    <view-subtitle title="Galaxy Settings"/>
    <div class="table-responsive" v-if="game">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Galaxy Type</td>
            <td class="text-right">{{ getFriendlyText(game.settings.galaxy.galaxyType) }}</td>
          </tr>
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
    <div class="table-responsive" v-if="game">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Carrier Cost</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.carrierCost) }}</td>
          </tr>
          <tr>
            <td>Carrier Upkeep Cost</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.carrierUpkeepCost) }}</td>
          </tr>
          <tr>
            <td>Warpgate Cost</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.warpgateCost) }}</td>
          </tr>
          <tr>
            <td>Specialist Cost</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.specialistCost) }}</td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.specialistCost !== 'none'">
            <td>Specialist Currency</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.specialistsCurrency) }}</td>
          </tr>
          <tr>
            <td>Random Warp Gates</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomWarpGates) }}%</td>
          </tr>
          <tr>
            <td>Random Worm Holes</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomWormHoles) }}%</td>
          </tr>
          <tr>
            <td>Random Nebulas</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomNebulas) }}%</td>
          </tr>
          <tr>
            <td>Random Asteroid Fields</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomAsteroidFields) }}%</td>
          </tr>
          <tr>
            <td>Dark Galaxy</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.darkGalaxy) }}</td>
          </tr>
          <tr>
            <td>Gift Carriers</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.giftCarriers) }}</td>
          </tr>
          <tr>
            <td>Defender Bonus</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.defenderBonus) }}</td>
          </tr>
          <tr>
            <td>Carrier-to-Carrier Combat</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.carrierToCarrierCombat) }}</td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.splitResources != undefined">
            <td>Split Resources</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.splitResources) }}</td>
          </tr>
          <tr>
            <td>Resource Distribution</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.resourceDistribution) }}</td>
          </tr>
          <tr>
            <td>Player Distribution</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.playerDistribution) }}</td>
          </tr>
          <tr>
            <td>Carrier Speed</td>
            <td class="text-right">{{ game.settings.specialGalaxy.carrierSpeed / game.constants.distances.lightYear }}/ly tick</td>
          </tr>
        </tbody>
      </table>
    </div>

    <view-subtitle title="Orbital Mechanics"/>
    <div class="table-responsive" v-if="game">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Galaxy Rotation</td>
            <td class="text-right">{{ getFriendlyText(game.settings.orbitalMechanics.enabled) }}</td>
          </tr>
          <tr v-if="game.settings.orbitalMechanics.enabled === 'enabled'">
            <td>Orbit Speed</td>
            <td class="text-right">{{ game.settings.orbitalMechanics.orbitSpeed }}</td>
          </tr>
          <tr v-if="game.settings.orbitalMechanics.enabled === 'enabled'">
            <td>Orbit Origin</td>
            <td class="text-right">{{ getFriendlyText(game.settings.orbitalMechanics.orbitOrigin) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <view-subtitle title="Player Settings"/>
    <div class="table-responsive" v-if="game">
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
          <tr v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
            <td>Starting Specialist Tokens</td>
            <td class="text-right">{{ game.settings.player.startingCreditsSpecialists }}</td>
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
            <td>Trade Credits</td>
            <td class="text-right">
              <span v-if="game.settings.player.tradeCredits">Enabled</span>
              <span v-if="!game.settings.player.tradeCredits">Disabled</span>
            </td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
            <td>Trade Specialist Tokens</td>
            <td class="text-right" v-if="game.settings.player.tradeCreditsSpecialists != null">
              <span v-if="game.settings.player.tradeCreditsSpecialists">Enabled</span>
              <span v-if="!game.settings.player.tradeCreditsSpecialists">Disabled</span>
            </td>
          </tr>
          <tr>
            <td>Trade Cost</td>
            <td class="text-right" v-if="game.settings.player.tradeCost > 0">{{ getFriendlyText(game.settings.player.tradeCost) }} credits/level</td>
            <td class="text-right" v-if="game.settings.player.tradeCost === 0">Disabled</td>
          </tr>
          <tr v-if="game.settings.player.tradeCost > 0">
            <td>Trade Scanning</td>
            <td class="text-right">{{ getFriendlyText(game.settings.player.tradeScanning) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <view-subtitle title="Technology Settings"/>
    <div class="table-responsive" v-if="game">
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
          <tr v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
            <td>Starting Specialists Level</td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.specialists }}</td>
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
          <tr>
            <td>Specialists Cost</td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.specialists) }}</td>
          </tr>
          <tr>
            <td>Banking Reward</td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.bankingReward) }}</td>
          </tr>
          <tr>
            <td>Specialist Token Reward</td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.specialistTokenReward) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ViewSubtitle from '../../ViewSubtitle.vue'

export default {
  components: {
    'view-subtitle': ViewSubtitle
  },
  props: {
    game: Object
  },
  methods: {
    getFriendlyText (option) {
      let text = {
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
        'scanned': 'Scanned Only',
        'realTime': 'Real Time',
        'turnBased': 'Turn Based',
        'random': 'Random',
        'weightedCenter': 'Weighted (Center)',
        'circular': 'Circular',
        'spiral': 'Spiral',
        'doughnut': 'Doughnut',
        'normal': 'Normal',
        'extra': 'Extra',
        'hidden': 'Hidden',
        'visible': 'Visible',
        'experimental': 'Experimental',
        'credits': 'Credits',
        'creditsSpecialists': 'Specialist Tokens',
        'conquest': 'Conquest',
        'battleRoyale': 'Battle Royale',
        'establishedPlayers': 'Established Players Only',
        'galacticCenter': 'Galactic Center',
        'galacticCenterOfMass': 'Galactic Center of Mass',
        'starPercentage': 'Star Percentage',
        'homeStarPercentage': 'Capital Star Percentage'
      }[option]

      return text || option
    }
  }
}
</script>

<style scoped>
</style>
