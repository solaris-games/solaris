<template>
  <div>
    <loading-spinner :loading="!game || !compareSettings" />

    <div v-if="game && compareSettings">
      <p class="mb-2">
        <small>Settings are <span class="text-warning">highlighted</span> if they differ from standard.</small>
      </p>
      <view-subtitle title="General Settings" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Mode"
              tooltip="The game mode Conquest is victory by stars, Battle Royale is last man standing in a constantly shrinking galaxy, King of the Hill is a fight for a key star, Team conquest is Conquest, but with teams"
              :valueText="getFriendlyText(game.settings.general.mode)" :value="game.settings.general.mode"
              :compareValue="compareSettings.general.mode" />
            <game-setting-value title="Victory Condition"
              tooltip="The victory condition in which a Conquest game will be decided."
              :valueText="getFriendlyText(game.settings.conquest.victoryCondition)"
              :value="game.settings.conquest.victoryCondition" :compareValue="compareSettings.conquest.victoryCondition"
              v-if="game.settings.general.mode === 'conquest' || game.settings.general.mode === 'teamConquest'" />
            <game-setting-value title="Stars For Victory"
              tooltip="How many stars are needed for a player to win the game"
              :valueText="game.settings.conquest.victoryPercentage + '%'"
              :value="game.settings.conquest.victoryPercentage"
              :compareValue="compareSettings.conquest.victoryPercentage"
              v-if="game.settings.general.mode === 'conquest' || game.settings.general.mode === 'teamConquest'" />
            <game-setting-value title="Capital Star Elimination"
              tooltip="Determines whether players become defeated if they lose control of their capital star"
              :valueText="getFriendlyText(game.settings.conquest.capitalStarElimination)"
              :value="game.settings.conquest.capitalStarElimination"
              :compareValue="compareSettings.conquest.capitalStarElimination"
              v-if="game.settings.general.mode === 'conquest' || game.settings.general.mode === 'teamConquest'" />
            <game-setting-value title="Number of teams" tooltip="The number of teams in the game"
              :valueText="game.settings.conquest.teamsCount" :value="game.settings.conquest.teamsCount"
              :compare-value="0" v-if="game.settings.general.mode === 'teamConquest' && game.settings.conquest.teamsCount" />
            <game-setting-value title="Countdown Cycles"
              tooltip="How long the countdown is to the end of the game in production cycles when the center star is captured"
              :valueText="game.settings.kingOfTheHill.productionCycles"
              :value="game.settings.kingOfTheHill.productionCycles"
              :compareValue="10"
              v-if="game.settings.general.mode === 'kingOfTheHill' && game.settings.kingOfTheHill" />
            <game-setting-value title="Flux" tooltip="Determines whether this month's flux is applied to the game"
              :valueText="getFriendlyText(game.settings.general.fluxEnabled)" :value="game.settings.general.fluxEnabled"
              :compareValue="compareSettings.general.fluxEnabled" />
            <game-setting-value title="Players" tooltip="Total number of player slots"
              :valueText="game.settings.general.playerLimit" :value="game.settings.general.playerLimit"
              :compareValue="compareSettings.general.playerLimit" />
            <game-setting-value title="Player Type" tooltip="Determines what type of players can join the game"
              :valueText="getFriendlyText(game.settings.general.playerType)" :value="game.settings.general.playerType"
              :compareValue="compareSettings.general.playerType" />
            <game-setting-value title="Anonymity"
              tooltip="Extra anonymity will hide player identities such as their Victories, Rank and Renown"
              :valueText="getFriendlyText(game.settings.general.anonymity)" :value="game.settings.general.anonymity"
              :compareValue="compareSettings.general.anonymity" />
            <game-setting-value title="Player Online Status"
              tooltip="Determines whether players can see who is online in real time"
              :valueText="getFriendlyText(game.settings.general.playerOnlineStatus)"
              :value="game.settings.general.playerOnlineStatus"
              :compareValue="compareSettings.general.playerOnlineStatus" />
            <game-setting-value title="Advanced AI" tooltip="Use the advanced AI to replace defeated players"
              :valueText="getFriendlyText(game.settings.general.advancedAI)" :value="game.settings.general.advancedAI"
              :compareValue="compareSettings.general.advancedAI" />
            <game-setting-value title="Allow Spectators" tooltip="Allow players to invite users to spectate the game"
              :valueText="getFriendlyText(game.settings.general.spectators)" :value="game.settings.general.spectators"
              :compareValue="compareSettings.general.spectators" />
            <game-setting-value title="Allow Ready To Quit"
              tooltip="Allow players to 'Ready To Quit' to finish games early"
              :valueText="getFriendlyText(game.settings.general.readyToQuit)" :value="game.settings.general.readyToQuit"
              :compareValue="compareSettings.general.readyToQuit" />
            <game-setting-value title="Fraction of stars for RTQ" v-if="game.settings.general.readyToQuit === 'enabled' && game.settings.general.readyToQuitFraction !== undefined"
              tooltip="Fraction of stars for triggering RTQ condition"
              :valueText="game.settings.general.readyToQuitFraction" :value="game.settings.general.readyToQuitFraction"
              :compareValue="compareSettings.general.readyToQuitFraction" />
            <game-setting-value title="Timer for RTQ" v-if="game.settings.general.readyToQuit === 'enabled' && game.settings.general.readyToQuitTimerCycles !== undefined"
              tooltip="Time until game finishes after RTQ" :valueText="game.settings.general.readyToQuitTimerCycles"
              :value="game.settings.general.readyToQuitTimerCycles"
              :compareValue="compareSettings.general.readyToQuitTimerCycles" />
            <game-setting-value title="RTQ Visibility" v-if="game.settings.general.readyToQuit === 'enabled'"
                                tooltip="Visibility of RTQ votes" :valueText="game.settings.general.readyToQuitVisibility"
                                :value="game.settings.general.readyToQuitVisibility"
                                :compareValue="compareSettings.general.readyToQuitVisibility" />
            <game-setting-value title="Players that will receive rank" tooltip="Players that will receive rank"
              :valueText="getFriendlyText(game.settings.general.awardRankTo)" :value="game.settings.general.awardRankTo"
              :compareValue="compareSettings.general.awardRankTo" />
            <game-setting-value v-if="game.settings.general.awardRankTo === 'top_n' && game.settings.general.awardRankToTopN !== undefined"
              title="Number of top/bottom players for rank distribution"
              tooltip="Top N players will receive rank, and bottom N players will lose rank"
              :valueText="game.settings.general.awardRankToTopN" :value="game.settings.general.awardRankToTopN"
              :compareValue="compareSettings.general.awardRankToTopN" />
            <game-setting-value title="Allow Abandon Stars" tooltip="Allow players to abandon their stars"
              :valueText="getFriendlyText(game.settings.player.allowAbandonStars)"
              :value="game.settings.player.allowAbandonStars"
              :compareValue="compareSettings.player.allowAbandonStars" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Game Time Settings" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Game Type"
              tooltip="Real time games are constantly running however Turn based games all players must submit their turn in order for the game to progress"
              :valueText="getFriendlyText(game.settings.gameTime.gameType)" :value="game.settings.gameTime.gameType"
              :compareValue="compareSettings.gameTime.gameType" />
            <game-setting-value title="Game Speed" tooltip="Determines how fast a single tick will take"
              :valueText="game.settings.gameTime.speed >= 60 ? (game.settings.gameTime.speed / 60) + ' minute(s)/tick' : game.settings.gameTime.speed + 'second(s)/tick'"
              :value="game.settings.gameTime.speed" :compareValue="compareSettings.gameTime.speed"
              v-if="game.settings.gameTime.gameType === 'realTime'" />
            <game-setting-value title="Tick Limited" tooltip="Determines whether the game has a time limit"
              :valueText="getFriendlyText(game.settings.gameTime.isTickLimited)"
              :value="game.settings.gameTime.isTickLimited" :compareValue="compareSettings.gameTime.isTickLimited" />
            <game-setting-value title="Tick Limit"
              v-if="game.settings.gameTime.isTickLimited === 'enabled' && game.settings.gameTime.tickLimit"
              tooltip="Determines the maximum number of ticks before the game is automatically concluded"
              :valueText="game.settings.gameTime.tickLimit + ' ticks'" :value="game.settings.gameTime.tickLimit"
              :compareValue="compareSettings.gameTime.tickLimit" />
            <game-setting-value title="Start Delay"
              tooltip="Determines how long the warmup period is before games start, for large games it is recommended to have a long start delay"
              :valueText="game.settings.gameTime.startDelay + ' minutes'" :value="game.settings.gameTime.startDelay"
              :compareValue="compareSettings.gameTime.startDelay"
              v-if="game.settings.gameTime.gameType === 'realTime'" />
            <game-setting-value title="Turn Jumps" tooltip="Determines how many ticks are processed for a single turn"
              :valueText="game.settings.gameTime.turnJumps + ' tick jumps'" :value="game.settings.gameTime.turnJumps"
              :compareValue="compareSettings.gameTime.turnJumps"
              v-if="game.settings.gameTime.gameType === 'turnBased'" />
            <game-setting-value title="Max Turn Wait"
              tooltip="The timeout period in which players have to take their turn, if the limit is reached then the turn will process regardless of whether players are ready or not"
              :valueText="game.settings.gameTime.maxTurnWait >= 60 ? (game.settings.gameTime.maxTurnWait / 60) + ' hour(s)' : game.settings.gameTime.maxTurnWait + ' minute(s)'"
              :value="game.settings.gameTime.maxTurnWait" :compareValue="compareSettings.gameTime.maxTurnWait"
              v-if="game.settings.gameTime.gameType === 'turnBased'" />
            <game-setting-value title="AFK Last Seen Limit"
              tooltip="Determines how long before a player is kicked for being AFK - This is paired with the AFK Galactic Cycle Limit setting, the timeout is whichever comes first"
              :valueText="game.settings.gameTime.afk.lastSeenTimeout + ' day(s)'"
              :value="game.settings.gameTime.afk.lastSeenTimeout"
              :compareValue="compareSettings.gameTime.afk.lastSeenTimeout" />
            <game-setting-value title="AFK Galactic Cycle Limit"
              tooltip="Determines how many cycles before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"
              :valueText="game.settings.gameTime.afk.cycleTimeout + ' cycles'"
              :value="game.settings.gameTime.afk.cycleTimeout" :compareValue="compareSettings.gameTime.afk.cycleTimeout"
              v-if="game.settings.gameTime.gameType === 'realTime'" />
            <game-setting-value title="AFK Missed Turn Limit"
              tooltip="Determines how many missed turns before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"
              :valueText="game.settings.gameTime.afk.turnTimeout + ' missed turns'"
              :value="game.settings.gameTime.afk.turnTimeout" :compareValue="compareSettings.gameTime.afk.turnTimeout"
              v-if="game.settings.gameTime.gameType === 'turnBased'" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Galaxy Settings" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Galaxy Type"
              tooltip="The shape of the galaxy that will be generated for the game"
              :valueText="getFriendlyText(game.settings.galaxy.galaxyType)" :value="game.settings.galaxy.galaxyType"
              :compareValue="compareSettings.galaxy.galaxyType" />
            <game-setting-value title="Stars Per Player"
              tooltip="How many stars will be generated per player in the galaxy"
              :valueText="game.settings.galaxy.starsPerPlayer" :value="game.settings.galaxy.starsPerPlayer"
              :compareValue="compareSettings.galaxy.starsPerPlayer" />
            <game-setting-value title="Production Ticks" tooltip="How many ticks are in a galactic cycle"
              :valueText="game.settings.galaxy.productionTicks + ' ticks/cycle'"
              :value="game.settings.galaxy.productionTicks" :compareValue="compareSettings.galaxy.productionTicks" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Special Galaxy Settings" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Carrier Cost" tooltip="Determines how expensive carriers cost to build"
              :valueText="getFriendlyText(game.settings.specialGalaxy.carrierCost)"
              :value="game.settings.specialGalaxy.carrierCost"
              :compareValue="compareSettings.specialGalaxy.carrierCost" />
            <game-setting-value title="Carrier Upkeep Cost"
              tooltip="Determines how expensive the carrier upkeep is - Upkeep is paid at the end of a galactic cycle"
              :valueText="getFriendlyText(game.settings.specialGalaxy.carrierUpkeepCost)"
              :value="game.settings.specialGalaxy.carrierUpkeepCost"
              :compareValue="compareSettings.specialGalaxy.carrierUpkeepCost" />
            <game-setting-value title="Warpgate Cost" tooltip="Determines how expensive warp gates cost to build"
              :valueText="getFriendlyText(game.settings.specialGalaxy.warpgateCost)"
              :value="game.settings.specialGalaxy.warpgateCost"
              :compareValue="compareSettings.specialGalaxy.warpgateCost" />
            <game-setting-value title="Specialist Cost" tooltip="Determines how expensive specialists cost to hire"
              :valueText="getFriendlyText(game.settings.specialGalaxy.specialistCost)"
              :value="game.settings.specialGalaxy.specialistCost"
              :compareValue="compareSettings.specialGalaxy.specialistCost" />
            <game-setting-value title="Specialist Currency"
              tooltip="Determines the type of currency used to hire specialists"
              :valueText="getFriendlyText(game.settings.specialGalaxy.specialistsCurrency)"
              :value="game.settings.specialGalaxy.specialistsCurrency"
              :compareValue="compareSettings.specialGalaxy.specialistsCurrency"
              v-if="game.settings.specialGalaxy.specialistCost !== 'none'" />
            <game-setting-value title="Random Warp Gates"
              tooltip="The percentage of random warp gates are seeded at the start of the game - Warp gates increase carrier movement speed"
              :valueText="game.settings.specialGalaxy.randomWarpGates + '%'"
              :value="game.settings.specialGalaxy.randomWarpGates"
              :compareValue="compareSettings.specialGalaxy.randomWarpGates"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Random Worm Holes"
              tooltip="The percentage of random worm holes are generated in the galaxy - Worm holes provide instant travel between paired worm hole stars"
              :valueText="game.settings.specialGalaxy.randomWormHoles + '%'"
              :value="game.settings.specialGalaxy.randomWormHoles"
              :compareValue="compareSettings.specialGalaxy.randomWormHoles"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Random Nebulas"
              tooltip="The percentage of random nebulas are generated in the galaxy - Nebulas hide ships at stars"
              :valueText="game.settings.specialGalaxy.randomNebulas + '%'"
              :value="game.settings.specialGalaxy.randomNebulas"
              :compareValue="compareSettings.specialGalaxy.randomNebulas"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Random Asteroid Fields"
              tooltip="The percentage of random asteroid fields are generated in the galaxy - Asteroid fields have +1 defender bonus (net +2 weapons) in combat"
              :valueText="game.settings.specialGalaxy.randomAsteroidFields + '%'"
              :value="game.settings.specialGalaxy.randomAsteroidFields"
              :compareValue="compareSettings.specialGalaxy.randomAsteroidFields"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Random Binary Stars"
              tooltip="The percentage of random binary stars are generated in the galaxy - Binary stars start with additional natural resources"
              :valueText="game.settings.specialGalaxy.randomBinaryStars + '%'"
              :value="game.settings.specialGalaxy.randomBinaryStars"
              :compareValue="compareSettings.specialGalaxy.randomBinaryStars"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Random Black Holes"
              tooltip="The percentage of random black holes are generated in the galaxy - Black holes cannot have infrastructure but have +3 scanning range"
              :valueText="game.settings.specialGalaxy.randomBlackHoles + '%'"
              :value="game.settings.specialGalaxy.randomBlackHoles"
              :compareValue="compareSettings.specialGalaxy.randomBlackHoles"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Random Pulsars"
              tooltip="The percentage of random pulsars are generated in the galaxy - Pulsars are always visible to all players in the game"
              :valueText="game.settings.specialGalaxy.randomPulsars + '%'"
              :value="game.settings.specialGalaxy.randomPulsars"
              :compareValue="compareSettings.specialGalaxy.randomPulsars"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Dark Galaxy"
              tooltip="Dark galaxies hide stars outside of player scanning ranges - Extra dark galaxies hide player statistics so that players only know what other players have based on what they can see in their scanning range"
              :valueText="getFriendlyText(game.settings.specialGalaxy.darkGalaxy)"
              :value="game.settings.specialGalaxy.darkGalaxy"
              :compareValue="compareSettings.specialGalaxy.darkGalaxy" />
            <game-setting-value title="Gift Carriers"
              tooltip="Determines whether carriers can be gifted to other players"
              :valueText="getFriendlyText(game.settings.specialGalaxy.giftCarriers)"
              :value="game.settings.specialGalaxy.giftCarriers"
              :compareValue="compareSettings.specialGalaxy.giftCarriers" />
            <game-setting-value title="Defender Bonus"
              tooltip="Enables or disables the defender bonus - Grants +1 to the defender in carrier-to-star combat"
              :valueText="getFriendlyText(game.settings.specialGalaxy.defenderBonus)"
              :value="game.settings.specialGalaxy.defenderBonus"
              :compareValue="compareSettings.specialGalaxy.defenderBonus" />
            <game-setting-value title="Carrier-to-Carrier Combat"
              tooltip="Determines whether carrier-to-carrier combat is enabled. If disabled, carriers will not fight eachother in space"
              :valueText="getFriendlyText(game.settings.specialGalaxy.carrierToCarrierCombat)"
              :value="game.settings.specialGalaxy.carrierToCarrierCombat"
              :compareValue="compareSettings.specialGalaxy.carrierToCarrierCombat" />
            <game-setting-value title="Split Resources"
              tooltip="Determines whether star natural resources are independent values, giving the game more granular infrastructure costs"
              :valueText="getFriendlyText(game.settings.specialGalaxy.splitResources)"
              :value="game.settings.specialGalaxy.splitResources"
              :compareValue="compareSettings.specialGalaxy.splitResources"
              v-if="game.settings.specialGalaxy.splitResources" />
            <game-setting-value title="Resource Distribution"
              tooltip="Determines the shape of distributed natural resources in the galaxy"
              :valueText="getFriendlyText(game.settings.specialGalaxy.resourceDistribution)"
              :value="game.settings.specialGalaxy.resourceDistribution"
              :compareValue="compareSettings.specialGalaxy.resourceDistribution"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Player Distribution"
              tooltip="Determines where player home stars are located at the start of the game"
              :valueText="getFriendlyText(game.settings.specialGalaxy.playerDistribution)"
              :value="game.settings.specialGalaxy.playerDistribution"
              :compareValue="compareSettings.specialGalaxy.playerDistribution"
              v-if="game.settings.galaxy.galaxyType !== 'custom'" />
            <game-setting-value title="Carrier Speed" tooltip="Carriers go brrr"
              :valueText="(game.settings.specialGalaxy.carrierSpeed / game.constants.distances.lightYear) + ' ly/tick'"
              :value="game.settings.specialGalaxy.carrierSpeed"
              :compareValue="compareSettings.specialGalaxy.carrierSpeed" />
            <game-setting-value title="Star Capture Rewards"
              tooltip="Determines whether economic infrastructure is destroyed on star capture and if the attacker is awarded cash for destroying them"
              :valueText="getFriendlyText(game.settings.specialGalaxy.starCaptureReward)"
              :value="game.settings.specialGalaxy.starCaptureReward"
              :compareValue="compareSettings.specialGalaxy.starCaptureReward" />
            <game-setting-value title="Combat resolution: weapons malus"
              tooltip="Determines on which carrier a specialist must be present for its weapons debuff to affect a group of carriers"
              :valueText="getFriendlyText(game.settings.specialGalaxy.combatResolutionMalusStrategy)"
              :value="game.settings.specialGalaxy.combatResolutionMalusStrategy" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Orbital Mechanics" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Galaxy Rotation"
              tooltip="If enabled, orbits stars and carriers around the center of the galaxy every tick"
              :valueText="getFriendlyText(game.settings.orbitalMechanics.enabled)"
              :value="game.settings.orbitalMechanics.enabled"
              :compareValue="compareSettings.orbitalMechanics.enabled" />
            <game-setting-value title="Orbit Speed" tooltip="Determines how fast stars and carriers orbit"
              :valueText="game.settings.orbitalMechanics.orbitSpeed" :value="game.settings.orbitalMechanics.orbitSpeed"
              :compareValue="compareSettings.orbitalMechanics.orbitSpeed"
              v-if="game.settings.orbitalMechanics.enabled === 'enabled'" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Player Settings" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Starting Stars"
              tooltip="Determines how many stars each player is allocated at the start of the game"
              :valueText="game.settings.player.startingStars" :value="game.settings.player.startingStars"
              :compareValue="compareSettings.player.startingStars" />
            <game-setting-value title="Starting Credits"
              tooltip="Determines how many credits each player is allocated at the start of the game"
              :valueText="game.settings.player.startingCredits" :value="game.settings.player.startingCredits"
              :compareValue="compareSettings.player.startingCredits" />
            <game-setting-value title="Starting Specialist Tokens"
              tooltip="Determines how many specialist tokens each player is allocated at the start of the game"
              :valueText="game.settings.player.startingCreditsSpecialists"
              :value="game.settings.player.startingCreditsSpecialists"
              :compareValue="compareSettings.player.startingCreditsSpecialists"
              v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'" />
            <game-setting-value title="Starting Ships"
              tooltip="Determines how many ships the home star of each player is allocated at the start of the game"
              :valueText="game.settings.player.startingShips" :value="game.settings.player.startingShips"
              :compareValue="compareSettings.player.startingShips" />
            <game-setting-value title="Starting Economy"
              tooltip="Determines the infrastructure of the home star of each player at the start of the game"
              :valueText="game.settings.player.startingInfrastructure.economy"
              :value="game.settings.player.startingInfrastructure.economy"
              :compareValue="compareSettings.player.startingInfrastructure.economy" />
            <game-setting-value title="Starting Industry"
              tooltip="Determines the infrastructure of the home star of each player at the start of the game"
              :valueText="game.settings.player.startingInfrastructure.industry"
              :value="game.settings.player.startingInfrastructure.industry"
              :compareValue="compareSettings.player.startingInfrastructure.industry" />
            <game-setting-value title="Starting Science"
              tooltip="Determines the infrastructure of the home star of each player at the start of the game"
              :valueText="game.settings.player.startingInfrastructure.science"
              :value="game.settings.player.startingInfrastructure.science"
              :compareValue="compareSettings.player.startingInfrastructure.science" />
            <game-setting-value title="Economy Cost"
              tooltip="Determines how expensive infrastructure costs to build. If disabled, then one third of all stars will start with the starting economic infrastructure"
              :valueText="getFriendlyText(game.settings.player.developmentCost.economy)"
              :value="game.settings.player.developmentCost.economy"
              :compareValue="compareSettings.player.developmentCost.economy" />
            <game-setting-value title="Industry Cost"
              tooltip="Determines how expensive infrastructure costs to build. If disabled, then one third of all stars will start with the starting industry infrastructure"
              :valueText="getFriendlyText(game.settings.player.developmentCost.industry)"
              :value="game.settings.player.developmentCost.industry"
              :compareValue="compareSettings.player.developmentCost.industry" />
            <game-setting-value title="Science Cost"
              tooltip="Determines how expensive infrastructure costs to build. If disabled, then one third of all stars will start with the starting science infrastructure"
              :valueText="getFriendlyText(game.settings.player.developmentCost.science)"
              :value="game.settings.player.developmentCost.science"
              :compareValue="compareSettings.player.developmentCost.science" />
            <game-setting-value title="Trade Credits" tooltip="Determines whether players can trade credits"
              :valueText="game.settings.player.tradeCredits ? 'Enabled' : 'Disabled'"
              :value="game.settings.player.tradeCredits" :compareValue="compareSettings.player.tradeCredits" />
            <game-setting-value title="Trade Specialist Tokens"
              tooltip="Determines whether players can trade specialist tokens"
              :valueText="game.settings.player.tradeCreditsSpecialists ? 'Enabled' : 'Disabled'"
              :value="game.settings.player.tradeCreditsSpecialists"
              :compareValue="compareSettings.player.tradeCreditsSpecialists"
              v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists' && game.settings.player.tradeCreditsSpecialists != null" />
            <game-setting-value title="Technology Trade Cost"
              tooltip="Determines how expensive the technology trade fee costs"
              :valueText="game.settings.player.tradeCost > 0 ? getFriendlyText(game.settings.player.tradeCost.toString()) + ' credits/level' : 'Disabled'"
              :value="game.settings.player.tradeCost" :compareValue="compareSettings.player.tradeCost" />
            <game-setting-value title="Trade Scanning"
              tooltip="If enabled, players can only trade with other players who are in their scanning range"
              :valueText="getFriendlyText(game.settings.player.tradeScanning)"
              :value="game.settings.player.tradeScanning" :compareValue="compareSettings.player.tradeScanning"
              v-if="game.settings.player.tradeCost > 0" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Ship Population Cap" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Enabled"
              tooltip="If enabled, the maximum ship population per player will be restricted"
              :valueText="getFriendlyText(game.settings.player.populationCap.enabled)"
              :value="game.settings.player.populationCap.enabled"
              :compareValue="compareSettings.player.populationCap.enabled" />
            <game-setting-value title="Ships Per Star" v-if="game.settings.player.populationCap.enabled === 'enabled'"
              tooltip="Determines the max population of ships per star"
              :valueText="game.settings.player.populationCap.shipsPerStar"
              :value="game.settings.player.populationCap.shipsPerStar"
              :compareValue="compareSettings.player.populationCap.shipsPerStar" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Formal Alliances" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Enabled"
              tooltip="If enabled, players can change their diplomatic status to allied or enemies - Allied players can orbit eachother's stars and support eachother in combat"
              :valueText="getFriendlyText(game.settings.diplomacy.enabled)" :value="game.settings.diplomacy.enabled"
              :compareValue="compareSettings.diplomacy.enabled" />
            <game-setting-value title="Locked Alliances" tooltip="If enabled, alliances cannot be canceled."
              :valueText="getFriendlyText(game.settings.diplomacy.lockedAlliances)"
              :value="game.settings.diplomacy.lockedAlliances" :compareValue="compareSettings.diplomacy.lockedAlliances"
              v-if="game.settings.diplomacy.enabled === 'enabled'" />
            <game-setting-value title="Max Number of Alliances"
              tooltip="Determines how many formal alliance each player may have at once"
              :valueText="getFriendlyText(game.settings.diplomacy.maxAlliances.toString())"
              :value="game.settings.diplomacy.maxAlliances" :compareValue="compareSettings.diplomacy.maxAlliances"
              v-if="game.settings.diplomacy.enabled === 'enabled'" />
            <game-setting-value title="Alliance Upkeep Cost"
              tooltip="Determines how expensive the alliance upkeep is - Upkeep is paid at the end of a galactic cycle"
              :valueText="getFriendlyText(game.settings.diplomacy.upkeepCost)"
              :value="game.settings.diplomacy.upkeepCost" :compareValue="compareSettings.diplomacy.upkeepCost"
              v-if="game.settings.diplomacy.enabled === 'enabled'" />
            <game-setting-value title="Alliance Only Trading"
              tooltip="If enabled, players can only trade with formal allies"
              :valueText="getFriendlyText(game.settings.diplomacy.tradeRestricted)"
              :value="game.settings.diplomacy.tradeRestricted" :compareValue="compareSettings.diplomacy.tradeRestricted"
              v-if="game.settings.diplomacy.enabled === 'enabled'" />
            <game-setting-value title="Global Events"
              tooltip="If enabled, global events will be displayed when players declare war or make peace"
              :valueText="getFriendlyText(game.settings.diplomacy.globalEvents)"
              :value="game.settings.diplomacy.globalEvents" :compareValue="compareSettings.diplomacy.globalEvents"
              v-if="game.settings.diplomacy.enabled === 'enabled'" />
          </tbody>
        </table>
      </div>

      <view-subtitle title="Technology Settings" />
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <game-setting-value title="Starting Terraforming Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.terraforming"
              :value="game.settings.technology.startingTechnologyLevel.terraforming"
              :compareValue="compareSettings.technology.startingTechnologyLevel.terraforming" />
            <game-setting-value title="Starting Experimentation Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.experimentation"
              :value="game.settings.technology.startingTechnologyLevel.experimentation"
              :compareValue="compareSettings.technology.startingTechnologyLevel.experimentation" />
            <game-setting-value title="Starting Scanning Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.scanning"
              :value="game.settings.technology.startingTechnologyLevel.scanning"
              :compareValue="compareSettings.technology.startingTechnologyLevel.scanning" />
            <game-setting-value title="Starting Hyperspace Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.hyperspace"
              :value="game.settings.technology.startingTechnologyLevel.hyperspace"
              :compareValue="compareSettings.technology.startingTechnologyLevel.hyperspace" />
            <game-setting-value title="Starting Manufacturing Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.manufacturing"
              :value="game.settings.technology.startingTechnologyLevel.manufacturing"
              :compareValue="compareSettings.technology.startingTechnologyLevel.manufacturing" />
            <game-setting-value title="Starting Banking Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.banking"
              :value="game.settings.technology.startingTechnologyLevel.banking"
              :compareValue="compareSettings.technology.startingTechnologyLevel.banking" />
            <game-setting-value title="Starting Weapons Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.weapons"
              :value="game.settings.technology.startingTechnologyLevel.weapons"
              :compareValue="compareSettings.technology.startingTechnologyLevel.weapons" />
            <game-setting-value title="Starting Specialists Level"
              tooltip="Determines the starting technology level for all players"
              :valueText="game.settings.technology.startingTechnologyLevel.specialists"
              :value="game.settings.technology.startingTechnologyLevel.specialists"
              :compareValue="compareSettings.technology.startingTechnologyLevel.specialists"
              v-if="game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'" />
            <game-setting-value title="Terraforming Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.terraforming)"
              :value="game.settings.technology.researchCosts.terraforming"
              :compareValue="compareSettings.technology.researchCosts.terraforming" />
            <game-setting-value title="Experimentation Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.experimentation)"
              :value="game.settings.technology.researchCosts.experimentation"
              :compareValue="compareSettings.technology.researchCosts.experimentation" />
            <game-setting-value title="Scanning Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.scanning)"
              :value="game.settings.technology.researchCosts.scanning"
              :compareValue="compareSettings.technology.researchCosts.scanning" />
            <game-setting-value title="Hyperspace Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.hyperspace)"
              :value="game.settings.technology.researchCosts.hyperspace"
              :compareValue="compareSettings.technology.researchCosts.hyperspace" />
            <game-setting-value title="Manufacturing Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.manufacturing)"
              :value="game.settings.technology.researchCosts.manufacturing"
              :compareValue="compareSettings.technology.researchCosts.manufacturing" />
            <game-setting-value title="Banking Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.banking)"
              :value="game.settings.technology.researchCosts.banking"
              :compareValue="compareSettings.technology.researchCosts.banking" />
            <game-setting-value title="Weapons Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.weapons)"
              :value="game.settings.technology.researchCosts.weapons"
              :compareValue="compareSettings.technology.researchCosts.weapons" />
            <game-setting-value title="Specialists Cost"
              tooltip="Determines how many research points it takes to level up the technology"
              :valueText="getFriendlyText(game.settings.technology.researchCosts.specialists)"
              :value="game.settings.technology.researchCosts.specialists"
              :compareValue="compareSettings.technology.researchCosts.specialists" />
            <game-setting-value title="Banking Reward"
              tooltip="Determines the amount of credits awarded for the banking technology at the end of a galactic cycle"
              :valueText="getFriendlyText(game.settings.technology.bankingReward)"
              :value="game.settings.technology.bankingReward"
              :compareValue="compareSettings.technology.bankingReward" />
            <game-setting-value v-if="game.settings.technology.startingTechnologyLevel.experimentation > 0"
              title="Experimentation Distribution"
              tooltip="Determines to what technologies the experimentation reward gets distributed"
              :valueText="getFriendlyText(game.settings.technology.experimentationDistribution)"
              :value="game.settings.technology.experimentationDistribution"
              :compareValue="compareSettings.technology.experimentationDistribution" />
            <game-setting-value v-if="game.settings.technology.researchCostProgression"
              title="Research Cost Progression"
              tooltip="Determines the growth of research points needed for the next level of technology"
              :valueText="getFriendlyText(game.settings.technology.researchCostProgression.progression)"
              :value="game.settings.technology.researchCostProgression.progression"
              :compareValue="compareSettings.technology.researchCostProgression.progression" />
            <game-setting-value
              v-if="game.settings.technology.researchCostProgression && game.settings.technology.researchCostProgression.progression === 'exponential'"
              title="Exponential growth factor" tooltip="Determines the speed of exponential growth"
              :valueText="getFriendlyText(game.settings.technology.researchCostProgression.growthFactor)"
              :value="game.settings.technology.researchCostProgression.growthFactor"
              compareValue="medium" />
            <game-setting-value title="Experimentation Reward"
              tooltip="Determines the amount of research points awarded for the experimentation technology at the end of a galactic cycle"
              :valueText="getFriendlyText(game.settings.technology.experimentationReward)"
              :value="game.settings.technology.experimentationReward"
              :compareValue="compareSettings.technology.experimentationReward" />
            <game-setting-value title="Specialist Token Reward"
              tooltip="Determines the amount of specialist tokens awarded for the specialist technology at the end of a galactic cycle"
              :valueText="getFriendlyText(game.settings.technology.specialistTokenReward)"
              :value="game.settings.technology.specialistTokenReward"
              :compareValue="compareSettings.technology.specialistTokenReward" />
          </tbody>
        </table>
      </div>

      <div v-if="game && game.settings.specialGalaxy.specialistCost !== 'none'">
        <view-subtitle title="Specialist Bans" />
        <specialist-ban-list :game="game" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ViewSubtitle from '../../../components/ViewSubtitle.vue';
import SpecialistBanList from '../specialist/SpecialistBanList.vue';
import GameSettingValue from './GameSettingValue.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import type { GameInfoDetail, GameSettingsSpec } from '@solaris-common';
import { ref, inject, type Ref, onMounted } from 'vue';
import { getDefaultSettings } from '@/services/typedapi/game';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';

const props = defineProps<{
  game: GameInfoDetail<string>,
}>();

const httpClient = inject(httpInjectionKey)!;

const compareSettings: Ref<GameSettingsSpec | null> = ref(null);

onMounted(async () => {
  const response = await getDefaultSettings(httpClient)();

  if (isOk(response)) {
    compareSettings.value = response.data;
  } else {
    console.error(formatError(response));
  }
});

const getFriendlyText = (option: string) => {
  const text = {
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
    'irregular': 'Irregular',
    'circular': 'Circular',
    'circularSequential': 'Circular (Sequential)',
    'spiral': 'Spiral',
    'doughnut': 'Doughnut',
    'circular-balanced': 'Circular Balanced',
    'normal': 'Normal',
    'extra': 'Extra',
    'hidden': 'Hidden',
    'visible': 'Visible',
    'experimental': 'Experimental',
    'credits': 'Credits',
    'creditsSpecialists': 'Specialist Tokens',
    'conquest': 'Conquest',
    'battleRoyale': 'Battle Royale',
    'teamConquest': 'Team Conquest',
    'establishedPlayers': 'Established Players Only',
    'galacticCenter': 'Galactic Center',
    'galacticCenterOfMass': 'Galactic Center of Mass',
    'starPercentage': 'Star Percentage',
    'homeStarPercentage': 'Capital Star Percentage',
    'kingOfTheHill': 'King Of The Hill',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'fog': 'Fogged',
    'soft': 'Soft',
    'hard': 'Hard',
    'exponential': 'Exponential',
    'winner': 'Winner',
    'top_n': 'Top N',
    'current_research': 'Current Research',
    'largestCarrier': "Largest carrier",
    'anyCarrier': "Any carrier",
    'revealAtEnd': "Anonymous, revealed at end",
  }[option]

  return text || option
};

const compareValue = <A>(fromValue: A, toValue: A) => {
  return fromValue !== toValue
};
</script>

<style scoped></style>
