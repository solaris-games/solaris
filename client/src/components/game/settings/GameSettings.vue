<template>
  <div>
    <view-subtitle title="General Settings"/>
    <div class="table-responsive" v-if="game">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Mode <help-tooltip tooltip="The game mode Conquest is victory by stars and Battle Royale is last man standing in a constantly shrinking galaxy"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.general.mode) }}</td>
          </tr>
          <tr v-if="game.settings.general.mode === 'conquest'">
            <td>Victory Condition <help-tooltip tooltip="The victory condition in which a Conquest game will be decided."/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.conquest.victoryCondition) }}</td>
          </tr>
          <tr v-if="game.settings.general.mode === 'conquest'">
            <td>Stars For Victory <help-tooltip tooltip="How many stars are needed for a player to win the game"/></td>
            <td class="text-right">{{ game.settings.conquest.victoryPercentage }}%</td>
          </tr>
          <tr>
            <td>Players <help-tooltip tooltip="Total number of player slots"/></td>
            <td class="text-right">{{ game.settings.general.playerLimit }}</td>
          </tr>
          <tr>
            <td>Player Type <help-tooltip tooltip="Determines what type of players can join the game"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.general.playerType) }}</td>
          </tr>
          <tr>
            <td>Anonymity <help-tooltip tooltip="Extra anonymity will hide player identities such as their Victories, Rank and Renown"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.general.anonymity) }}</td>
          </tr>
          <tr>
            <td>Player Online Status <help-tooltip tooltip="Determines whether players can see who is online in real time"/></td>
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
            <td>Game Type <help-tooltip tooltip="Real time games are constantly running however Turn based games all players must submit their turn in order for the game to progress"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.gameTime.gameType) }}</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'realTime'">
            <td>Game Speed <help-tooltip tooltip="Determines how fast a single tick will take"/></td>
            <td class="text-right" v-if="game.settings.gameTime.speed >= 60">{{ game.settings.gameTime.speed/60 }} minute(s)/tick</td>
            <td class="text-right" v-if="game.settings.gameTime.speed < 60">{{ game.settings.gameTime.speed }} second(s)/tick</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'realTime'">
            <td>Start Delay <help-tooltip tooltip="Determines how long the warmup period is before games start, for large games it is recommended to have a long start delay"/></td>
            <td class="text-right">{{ game.settings.gameTime.startDelay }} minutes</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'turnBased'">
            <td>Turn Jumps <help-tooltip tooltip="Determines how many ticks are processed for a single turn"/></td>
            <td class="text-right">{{ game.settings.gameTime.turnJumps }} tick jumps</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'turnBased'">
            <td>Max Turn Wait <help-tooltip tooltip="The timeout period in which players have to take their turn, if the limit is reached then the turn will process regardless of whether players are ready or not"/></td>
            <td class="text-right" v-if="game.settings.gameTime.maxTurnWait >= 60">{{ game.settings.gameTime.maxTurnWait/60 }} hour(s)</td>
            <td class="text-right" v-if="game.settings.gameTime.maxTurnWait < 60">{{ game.settings.gameTime.maxTurnWait }} minute(s)</td>
          </tr>
          <tr>
            <td>AFK Last Seen Limit <help-tooltip tooltip="Determines how long before a player is kicked for being AFK - This is paired with the AFK Galactic Cycle Limit setting, the timeout is whichever comes first"/></td>
            <td class="text-right">{{ game.settings.gameTime.afk.lastSeenTimeout }} day(s)</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'realTime'">
            <td>AFK Galactic Cycle Limit <help-tooltip tooltip="Determines how many cycles before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"/></td>
            <td class="text-right">{{ game.settings.gameTime.afk.cycleTimeout }} cycles</td>
          </tr>
          <tr v-if="game.settings.gameTime.gameType === 'turnBased'">
            <td>AFK Missed Turn Limit <help-tooltip tooltip="Determines how many missed turns before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"/></td>
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
            <td>Galaxy Type <help-tooltip tooltip="The shape of the galaxy that will be generated for the game"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.galaxy.galaxyType) }}</td>
          </tr>
          <tr>
            <td>Stars Per Player <help-tooltip tooltip="How many stars will be generated per player in the galaxy"/></td>
            <td class="text-right">{{ game.settings.galaxy.starsPerPlayer }}</td>
          </tr>
          <tr>
            <td>Production Ticks <help-tooltip tooltip="How many ticks are in a galactic cycle"/></td>
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
            <td>Carrier Cost <help-tooltip tooltip="Determines how expensive carriers cost to build"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.carrierCost) }}</td>
          </tr>
          <tr>
            <td>Carrier Upkeep Cost <help-tooltip tooltip="Determines how expensive the carrier upkeep is - Upkeep is paid at the end of a galactic cycle"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.carrierUpkeepCost) }}</td>
          </tr>
          <tr>
            <td>Warpgate Cost <help-tooltip tooltip="Determines how expensive warp gates cost to build"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.warpgateCost) }}</td>
          </tr>
          <tr>
            <td>Specialist Cost <help-tooltip tooltip="Determines how expensive specialists cost to hire"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.specialistCost) }}</td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.specialistCost !== 'none'">
            <td>Specialist Currency <help-tooltip tooltip="Determines the type of currency used to hire specialists"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.specialistsCurrency) }}</td>
          </tr>
          <tr>
            <td>Random Warp Gates <help-tooltip tooltip="The percentage of random warp gates are seeded at the start of the game - Warp gates increase carrier movement speed"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomWarpGates) }}%</td>
          </tr>
          <tr>
            <td>Random Worm Holes <help-tooltip tooltip="The percentage of random worm holes are generated in the galaxy - Worm holes provide instant travel between paired worm hole stars"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomWormHoles) }}%</td>
          </tr>
          <tr>
            <td>Random Nebulas <help-tooltip tooltip="The percentage of random nebulas are generated in the galaxy - Nebulas hide ships at stars"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomNebulas) }}%</td>
          </tr>
          <tr>
            <td>Random Asteroid Fields <help-tooltip tooltip="The percentage of random asteroid fields are generated in the galaxy - Asteroid fields start with additional resources and x2 defender bonus"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomAsteroidFields) }}%</td>
          </tr>
          <tr>
            <td>Random Black Holes <help-tooltip tooltip="The percentage of random black holes are generated in the galaxy - Black holes cannot have infrastructure but have +3 scanning range"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.randomBlackHoles) }}%</td>
          </tr>
          <tr>
            <td>Dark Galaxy <help-tooltip tooltip="Dark galaxies hide stars outside of player scanning ranges - Extra dark galaxies hide player statistics so that players only know what other players have based on what they can see in their scanning range"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.darkGalaxy) }}</td>
          </tr>
          <tr>
            <td>Gift Carriers <help-tooltip tooltip="Determines whether carriers can be gifted to other players"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.giftCarriers) }}</td>
          </tr>
          <tr>
            <td>Defender Bonus <help-tooltip tooltip="Enables or disables the defender bonus - Grants +1 to the defender in carrier-to-star combat"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.defenderBonus) }}</td>
          </tr>
          <tr>
            <td>Carrier-to-Carrier Combat <help-tooltip tooltip="Determines whether carrier-to-carrier combat is enabled. If disabled, carriers will not fight eachother in space"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.carrierToCarrierCombat) }}</td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.splitResources">
            <td>Split Resources</td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.splitResources) }}</td>
          </tr>
          <tr>
            <td>Resource Distribution <help-tooltip tooltip="Determines the shape of distributed natural resources in the galaxy"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.resourceDistribution) }}</td>
          </tr>
          <tr>
            <td>Player Distribution <help-tooltip tooltip="Determines where player home stars are located at the start of the game"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.specialGalaxy.playerDistribution) }}</td>
          </tr>
          <tr>
            <td>Carrier Speed <help-tooltip tooltip="Carriers go brrr"/></td>
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
            <td>Galaxy Rotation <help-tooltip tooltip="If enabled, orbits stars and carriers around the center of the galaxy every tick"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.orbitalMechanics.enabled) }}</td>
          </tr>
          <tr v-if="game.settings.orbitalMechanics.enabled === 'enabled'">
            <td>Orbit Speed <help-tooltip tooltip="Determines how fast stars and carriers orbit"/></td>
            <td class="text-right">{{ game.settings.orbitalMechanics.orbitSpeed }}</td>
          </tr>
          <tr v-if="game.settings.orbitalMechanics.enabled === 'enabled'">
            <td>Orbit Origin <help-tooltip tooltip="Determines the central point of which to orbit stars and carriers"/></td>
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
            <td>Starting Stars <help-tooltip tooltip="Determines how many stars each player is allocated at the start of the game"/></td>
            <td class="text-right">{{ game.settings.player.startingStars }}</td>
          </tr>
          <tr>
            <td>Starting Credits <help-tooltip tooltip="Determines how many credits each player is allocated at the start of the game"/></td>
            <td class="text-right">{{ game.settings.player.startingCredits }}</td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
            <td>Starting Specialist Tokens <help-tooltip tooltip="Determines how many specialist tokens each player is allocated at the start of the game"/></td>
            <td class="text-right">{{ game.settings.player.startingCreditsSpecialists }}</td>
          </tr>
          <tr>
            <td>Starting Ships <help-tooltip tooltip="Determines how many ships the home star of each player is allocated at the start of the game"/></td>
            <td class="text-right">{{ game.settings.player.startingShips }}</td>
          </tr>
          <tr>
            <td>Starting Economy <help-tooltip tooltip="Determines the infrastructure of the home star of each player at the start of the game"/></td>
            <td class="text-right">{{ game.settings.player.startingInfrastructure.economy }}</td>
          </tr>
          <tr>
            <td>Starting Industry <help-tooltip tooltip="Determines the infrastructure of the home star of each player at the start of the game"/></td>
            <td class="text-right">{{ game.settings.player.startingInfrastructure.industry }}</td>
          </tr>
          <tr>
            <td>Starting Science <help-tooltip tooltip="Determines the infrastructure of the home star of each player at the start of the game"/></td>
            <td class="text-right">{{ game.settings.player.startingInfrastructure.science }}</td>
          </tr>
          <tr>
            <td>Economy Cost <help-tooltip tooltip="Determines how expensive infrastructure costs to build"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.player.developmentCost.economy) }}</td>
          </tr>
          <tr>
            <td>Industry Cost <help-tooltip tooltip="Determines how expensive infrastructure costs to build"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.player.developmentCost.industry) }}</td>
          </tr>
          <tr>
            <td>Science Cost <help-tooltip tooltip="Determines how expensive infrastructure costs to build"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.player.developmentCost.science) }}</td>
          </tr>
          <tr>
            <td>Trade Credits <help-tooltip tooltip="Determines whether players can trade credits"/></td>
            <td class="text-right">
              <span v-if="game.settings.player.tradeCredits">Enabled</span>
              <span v-if="!game.settings.player.tradeCredits">Disabled</span>
            </td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
            <td>Trade Specialist Tokens <help-tooltip tooltip="Determines whether players can trade specialist tokens"/></td>
            <td class="text-right" v-if="game.settings.player.tradeCreditsSpecialists != null">
              <span v-if="game.settings.player.tradeCreditsSpecialists">Enabled</span>
              <span v-if="!game.settings.player.tradeCreditsSpecialists">Disabled</span>
            </td>
          </tr>
          <tr>
            <td>Technology Trade Cost <help-tooltip tooltip="Determines how expensive the technology trade fee costs"/></td>
            <td class="text-right" v-if="game.settings.player.tradeCost > 0">{{ getFriendlyText(game.settings.player.tradeCost) }} credits/level</td>
            <td class="text-right" v-if="game.settings.player.tradeCost === 0">Disabled</td>
          </tr>
          <tr v-if="game.settings.player.tradeCost > 0">
            <td>Trade Scanning <help-tooltip tooltip="If enabled, players can only trade with other players who are in their scanning range"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.player.tradeScanning) }}</td>
          </tr>
          <tr>
            <td>Formal Alliances <help-tooltip tooltip="If enabled, players can change their diplomatic status to allied or enemies - Allied players can orbit eachother's stars and support eachother in combat"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.player.alliances) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <view-subtitle title="Technology Settings"/>
    <div class="table-responsive" v-if="game">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Starting Terraforming Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.terraforming }}</td>
          </tr>
          <tr>
            <td>Starting Experimentation Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.experimentation }}</td>
          </tr>
          <tr>
            <td>Starting Scanning Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.scanning }}</td>
          </tr>
          <tr>
            <td>Starting Hyperspace Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.hyperspace }}</td>
          </tr>
          <tr>
            <td>Starting Manufacturing Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.manufacturing }}</td>
          </tr>
          <tr>
            <td>Starting Banking Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.banking }}</td>
          </tr>
          <tr>
            <td>Starting Weapons Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.weapons }}</td>
          </tr>
          <tr v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
            <td>Starting Specialists Level <help-tooltip tooltip="Determines the starting technology level for all players"/></td>
            <td class="text-right">{{ game.settings.technology.startingTechnologyLevel.specialists }}</td>
          </tr>
          <tr>
            <td>Terraforming Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.terraforming) }}</td>
          </tr>
          <tr>
            <td>Experimentation Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.experimentation) }}</td>
          </tr>
          <tr>
            <td>Scanning Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.scanning) }}</td>
          </tr>
          <tr>
            <td>Hyperspace Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.hyperspace) }}</td>
          </tr>
          <tr>
            <td>Manufacturing Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.manufacturing) }}</td>
          </tr>
          <tr>
            <td>Banking Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.banking) }}</td>
          </tr>
          <tr>
            <td>Weapons Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.weapons) }}</td>
          </tr>
          <tr>
            <td>Specialists Cost <help-tooltip tooltip="Determines how many research points it takes to level up the technology"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.researchCosts.specialists) }}</td>
          </tr>
          <tr>
            <td>Banking Reward <help-tooltip tooltip="Determines the amount of credits awarded for the banking technology at the end of a galactic cycle"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.bankingReward) }}</td>
          </tr>
          <tr>
            <td>Specialist Token Reward <help-tooltip tooltip="Determines the amount of specialist tokens awarded for the banking technology at the end of a galactic cycle"/></td>
            <td class="text-right">{{ getFriendlyText(game.settings.technology.specialistTokenReward) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ViewSubtitle from '../../ViewSubtitle.vue'
import HelpTooltip from '../../HelpTooltip'

export default {
  components: {
    'view-subtitle': ViewSubtitle,
    'help-tooltip': HelpTooltip
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
