<template>
  <view-container>
    <view-title title="Create Game" />
    <view-subtitle title="Game Settings"/>

    <loading-spinner :loading="!settings"/>

    <form @submit.prevent="handleSubmit" v-if="settings">
      <div class="form-group">
        <label for="name" class="col-form-label">Name <help-tooltip tooltip="The name of the game, make it short and sweet"/></label>
        <input type="text" required="required" class="form-control" id="name" minlength="3" maxlength="24" v-model="settings.general.name" :disabled="isCreatingGame">
      </div>

      <div class="form-group">
        <label for="description" class="col-form-label">Description <help-tooltip tooltip="Give your game a long description detailing some key settings and entice players to join your custom game"/></label>
        <textarea rows="4" class="form-control" id="description" v-model="settings.general.description"></textarea>
      </div>

      <div class="form-group">
        <label for="password" class="col-form-label">Password <help-tooltip tooltip="Password protect your game for you and a select group of players"/></label>
        <input type="password" class="form-control" id="password" v-model="settings.general.password" :disabled="isCreatingGame">
      </div>

      <div class="form-group">
        <label for="mode" class="col-form-label">Mode <help-tooltip tooltip="The game mode Conquest is victory by stars and Battle Royale is last man standing in a constantly shrinking galaxy"/></label>
        <select class="form-control" id="mode" v-model="settings.general.mode" :disabled="isCreatingGame">
          <option v-for="opt in options.general.mode" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.general.mode === 'conquest'">
        <label for="conquestVictoryCondition" class="col-form-label">Victory Condition <help-tooltip tooltip="The victory condition in which a Conquest game will be decided."/></label>
        <select class="form-control" id="conquestVictoryCondition" v-model="settings.conquest.victoryCondition" :disabled="isCreatingGame">
          <option v-for="opt in options.conquest.victoryCondition" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.general.mode === 'conquest'">
        <label for="conquestVictoryPercentage" class="col-form-label">Stars For Victory <help-tooltip tooltip="How many stars are needed for a player to win the game"/></label>
        <select class="form-control" id="conquestVictoryPercentage" v-model="settings.conquest.victoryPercentage" :disabled="isCreatingGame">
          <option v-for="opt in options.conquest.victoryPercentage" v-bind:key="opt" v-bind:value="opt">
            {{ opt }}% of <span v-if="settings.conquest.victoryCondition === 'homeStarPercentage'">Capital</span> Stars
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="players" class="col-form-label">Players <help-tooltip tooltip="Total number of player slots"/></label>
        <select class="form-control" id="players" v-model="settings.general.playerLimit" :disabled="isCreatingGame">
          <option v-for="opt in options.general.playerLimit" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Players
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="playerType" class="col-form-label">Player Type <help-tooltip tooltip="Determines what type of players can join the game"/></label>
        <select class="form-control" id="playerType" v-model="settings.general.playerType" :disabled="isCreatingGame">
          <option v-for="opt in options.general.playerType" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="anonymity" class="col-form-label">Anonymity <help-tooltip tooltip="Extra anonymity will hide player identities such as their Victories, Rank and Renown"/></label>
        <select class="form-control" id="anonymity" v-model="settings.general.anonymity" :disabled="isCreatingGame">
          <option v-for="opt in options.general.anonymity" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="playerOnlineStatus" class="col-form-label">Player Online Status <help-tooltip tooltip="Determines whether players can see who is online in real time"/></label>
        <select class="form-control" id="playerOnlineStatus" v-model="settings.general.playerOnlineStatus" :disabled="isCreatingGame">
          <option v-for="opt in options.general.playerOnlineStatus" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <form-error-list v-bind:errors="errors"/>

      <button type="submit" class="btn btn-success btn-lg mb-3 btn-block" :disabled="isCreatingGame"><i class="fas fa-gamepad"></i> Create Game</button>

      <loading-spinner :loading="isCreatingGame"/>

      <view-subtitle title="Game Time Settings"/>

      <div class="form-group">
        <label for="gameType" class="col-form-label">Game Type <help-tooltip tooltip="Real time games are constantly running however Turn based games all players must submit their turn in order for the game to progress"/></label>
        <select class="form-control" id="gameType" v-model="settings.gameTime.gameType" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.gameType" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.gameTime.gameType === 'realTime'">
        <label for="gameSpeed" class="col-form-label">Game Speed <help-tooltip tooltip="Determines how fast a single tick will take"/></label>
        <select class="form-control" id="gameSpeed" v-model="settings.gameTime.speed" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.speed" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.gameTime.gameType === 'realTime'">
        <label for="startDelay" class="col-form-label">Start Delay <help-tooltip tooltip="Determines how long the warmup period is before games start, for large games it is recommended to have a long start delay"/></label>
        <select class="form-control" id="startDelay" v-model="settings.gameTime.startDelay" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.startDelay" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.gameTime.gameType === 'turnBased'">
        <label for="turnJumps" class="col-form-label">Turn Jumps <help-tooltip tooltip="Determines how many ticks are processed for a single turn"/></label>
        <select class="form-control" id="turnJumps" v-model="settings.gameTime.turnJumps" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.turnJumps" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.gameTime.gameType === 'turnBased'">
        <label for="maxTurnWait" class="col-form-label">Max Turn Wait <help-tooltip tooltip="The timeout period in which players have to take their turn, if the limit is reached then the turn will process regardless of whether players are ready or not"/></label>
        <select class="form-control" id="maxTurnWait" v-model="settings.gameTime.maxTurnWait" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.maxTurnWait" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="lastSeenTimeout" class="col-form-label">AFK Last Seen Limit <help-tooltip tooltip="Determines how long before a player is kicked for being AFK - This is paired with the AFK Galactic Cycle Limit setting, the timeout is whichever comes first"/></label>
        <select class="form-control" id="lastSeenTimeout" v-model="settings.gameTime.afk.lastSeenTimeout" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.afk.lastSeenTimeout" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.gameTime.gameType === 'realTime'">
        <label for="cycleTimeout" class="col-form-label">AFK Galactic Cycle Limit <help-tooltip tooltip="Determines how many cycles before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"/></label>
        <select class="form-control" id="cycleTimeout" v-model="settings.gameTime.afk.cycleTimeout" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.afk.cycleTimeout" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.gameTime.gameType === 'turnBased'">
        <label for="turnTimeout" class="col-form-label">AFK Missed Turn Limit <help-tooltip tooltip="Determines how many missed turns before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"/></label>
        <select class="form-control" id="turnTimeout" v-model="settings.gameTime.afk.turnTimeout" :disabled="isCreatingGame">
          <option v-for="opt in options.gameTime.afk.turnTimeout" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <view-subtitle title="Galaxy Settings"/>

      <div class="form-group">
        <label for="galaxyType" class="col-form-label">Galaxy Type <help-tooltip tooltip="The shape of the galaxy that will be generated for the game"/></label>
        <select class="form-control" id="galaxyType" v-model="settings.galaxy.galaxyType" :disabled="isCreatingGame">
          <option v-for="opt in options.galaxy.galaxyType" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="starsPerPlayer" class="col-form-label">Stars Per Player <help-tooltip tooltip="How many stars will be generated per player in the galaxy"/></label>
        <select class="form-control" id="starsPerPlayer" v-model="settings.galaxy.starsPerPlayer" :disabled="isCreatingGame">
          <option v-for="opt in options.galaxy.starsPerPlayer" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="productionTicks" class="col-form-label">Production Ticks <help-tooltip tooltip="How many ticks are in a galactic cycle"/></label>
        <select class="form-control" id="productionTicks" v-model="settings.galaxy.productionTicks" :disabled="isCreatingGame">
          <option v-for="opt in options.galaxy.productionTicks" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Ticks
          </option>
        </select>
      </div>

      <view-subtitle title="Special Galaxy Settings"/>

      <div class="form-group">
        <label for="carrierCost" class="col-form-label">Carrier Cost <help-tooltip tooltip="Determines how expensive carriers cost to build"/></label>
        <select class="form-control" id="carrierCost" v-model="settings.specialGalaxy.carrierCost" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.carrierCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Carriers
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="carrierUpkeepCost" class="col-form-label">Carrier Upkeep Cost <help-tooltip tooltip="Determines how expensive the carrier upkeep is - Upkeep is paid at the end of a galactic cycle"/></label>
        <select class="form-control" id="carrierUpkeepCost" v-model="settings.specialGalaxy.carrierUpkeepCost" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.carrierUpkeepCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="warpgateCost" class="col-form-label">Warpgate Cost <help-tooltip tooltip="Determines how expensive warp gates cost to build"/></label>
        <select class="form-control" id="warpgateCost" v-model="settings.specialGalaxy.warpgateCost" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.warpgateCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Gates
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="specialistCost" class="col-form-label">Specialist Cost <help-tooltip tooltip="Determines how expensive specialists cost to hire"/></label>
        <select class="form-control" id="specialistCost" v-model="settings.specialGalaxy.specialistCost" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.specialistCost" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Specialists
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.specialGalaxy.specialistCost !== 'none'">
        <label for="specialistsCurrency" class="col-form-label">Specialist Currency <help-tooltip tooltip="Determines the type of currency used to hire specialists"/></label>
        <select class="form-control" id="specialistsCurrency" v-model="settings.specialGalaxy.specialistsCurrency" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.specialistsCurrency" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="randomWarpGates" class="col-form-label">Random Warp Gates (<span class="text-warning">{{settings.specialGalaxy.randomWarpGates}}%</span>) <help-tooltip tooltip="The percentage of random warp gates are seeded at the start of the game - Warp gates increase carrier movement speed"/></label>
        <div class="col">
          <input type="range" min="0" max="50" step="5" class="form-range w-100" id="randomWarpGates" v-model="settings.specialGalaxy.randomWarpGates" :disabled="isCreatingGame">
        </div>
      </div>

      <div class="form-group">
        <label for="randomWormHoles" class="col-form-label">Random Worm Holes (<span class="text-warning">{{settings.specialGalaxy.randomWormHoles}}%</span>) <help-tooltip tooltip="The percentage of random worm holes are generated in the galaxy - Worm holes provide instant travel between paired worm hole stars"/></label>
        <div class="col">
          <input type="range" min="0" max="50" step="5" class="form-range w-100" id="randomWormHoles" v-model="settings.specialGalaxy.randomWormHoles" :disabled="isCreatingGame">
        </div>
      </div>

      <div class="form-group">
        <label for="randomNebulas" class="col-form-label">Random Nebulas (<span class="text-warning">{{settings.specialGalaxy.randomNebulas}}%</span>) <help-tooltip tooltip="The percentage of random nebulas are generated in the galaxy - Nebulas hide ships at stars"/></label>
        <div class="col">
          <input type="range" min="0" max="50" step="5" class="form-range w-100" id="randomNebulas" v-model="settings.specialGalaxy.randomNebulas" :disabled="isCreatingGame">
        </div>
      </div>

      <div class="form-group">
        <label for="randomAsteroidFields" class="col-form-label">Random Asteroid Fields (<span class="text-warning">{{settings.specialGalaxy.randomAsteroidFields}}%</span>) <help-tooltip tooltip="The percentage of random asteroid fields are generated in the galaxy - Asteroid fields start with additional resources and x2 defender bonus"/></label>
        <div class="col">
          <input type="range" min="0" max="50" step="5" class="form-range w-100" id="randomAsteroidFields" v-model="settings.specialGalaxy.randomAsteroidFields" :disabled="isCreatingGame">
        </div>
      </div>

      <div class="form-group">
        <label for="randomBlackHoles" class="col-form-label">Random Black Holes (<span class="text-warning">{{settings.specialGalaxy.randomBlackHoles}}%</span>) <help-tooltip tooltip="The percentage of random black holes are generated in the galaxy - Black holes cannot have infrastructure but have +3 scanning range"/></label>
        <div class="col">
          <input type="range" min="0" max="50" step="5" class="form-range w-100" id="randomBlackHoles" v-model="settings.specialGalaxy.randomBlackHoles" :disabled="isCreatingGame">
        </div>
      </div>

      <div class="form-group">
        <label for="darkGalaxy" class="col-form-label">Dark Galaxy <help-tooltip tooltip="Dark galaxies hide stars outside of player scanning ranges - Extra dark galaxies hide player statistics so that players only know what other players have based on what they can see in their scanning range"/></label>
        <select class="form-control" id="darkGalaxy" v-model="settings.specialGalaxy.darkGalaxy" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.darkGalaxy" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="giftCarriers" class="col-form-label">Gift Carriers <help-tooltip tooltip="Determines whether carriers can be gifted to other players"/></label>
        <select class="form-control" id="giftCarriers" v-model="settings.specialGalaxy.giftCarriers" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.giftCarriers" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="defenderBonus" class="col-form-label">Defender Bonus <help-tooltip tooltip="Enables or disables the defender bonus - Grants +1 to the defender in carrier-to-star combat"/></label>
        <select class="form-control" id="defenderBonus" v-model="settings.specialGalaxy.defenderBonus" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.defenderBonus" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.orbitalMechanics.enabled === 'disabled'">
        <label for="carrierToCarrierCombat" class="col-form-label">Carrier-to-Carrier Combat <help-tooltip tooltip="Determines whether carrier-to-carrier combat is enabled. If disabled, carriers will not fight eachother in space"/></label>
        <select class="form-control" id="carrierToCarrierCombat" v-model="settings.specialGalaxy.carrierToCarrierCombat" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.carrierToCarrierCombat" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="splitResources" class="col-form-label">Split Resources</label>
        <select class="form-control" id="splitResources" v-model="settings.specialGalaxy.splitResources" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.splitResources" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="resourceDistribution" class="col-form-label">Resource Distribution <help-tooltip tooltip="Determines the shape of distributed natural resources in the galaxy"/></label>
        <select class="form-control" id="resourceDistribution" v-model="settings.specialGalaxy.resourceDistribution" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.resourceDistribution" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="playerDistribution" class="col-form-label">Player Distribution <help-tooltip tooltip="Determines where player home stars are located at the start of the game"/></label>
        <select class="form-control" id="playerDistribution" v-model="settings.specialGalaxy.playerDistribution" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.playerDistribution" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="carrierSpeed" class="col-form-label">Carrier Speed <help-tooltip tooltip="Carriers go brrr"/></label>
        <select class="form-control" id="carrierSpeed" v-model="settings.specialGalaxy.carrierSpeed" :disabled="isCreatingGame">
          <option v-for="opt in options.specialGalaxy.carrierSpeed" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <view-subtitle title="Orbital Mechanics"/>

      <div class="form-group">
        <label for="orbitalMechanicsEnabled" class="col-form-label">Galaxy Rotation <help-tooltip tooltip="If enabled, orbits stars and carriers around the center of the galaxy every tick"/></label>
        <select class="form-control" id="orbitalMechanicsEnabled" v-model="settings.orbitalMechanics.enabled" :disabled="isCreatingGame">
          <option v-for="opt in options.orbitalMechanics.enabled" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.orbitalMechanics.enabled === 'enabled'">
        <label for="orbitSpeed" class="col-form-label">Orbit Speed <help-tooltip tooltip="Determines how fast stars and carriers orbit"/></label>
        <select class="form-control" id="orbitSpeed" v-model="settings.orbitalMechanics.orbitSpeed" :disabled="isCreatingGame">
          <option v-for="opt in options.orbitalMechanics.orbitSpeed" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.orbitalMechanics.enabled === 'enabled'">
        <label for="orbitOrigin" class="col-form-label">Orbit Origin <help-tooltip tooltip="Determines the central point of which to orbit stars and carriers"/></label>
        <select class="form-control" id="orbitOrigin" v-model="settings.orbitalMechanics.orbitOrigin" :disabled="isCreatingGame">
          <option v-for="opt in options.orbitalMechanics.orbitOrigin" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <view-subtitle title="Player Settings"/>

      <div class="form-group">
        <label for="startingStars" class="col-form-label">Starting Stars <help-tooltip tooltip="Determines how many stars each player is allocated at the start of the game"/></label>
        <select class="form-control" id="startingStars" v-model="settings.player.startingStars" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingStars" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Stars
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="startingCredits" class="col-form-label">Starting Credits <help-tooltip tooltip="Determines how many credits each player is allocated at the start of the game"/></label>
        <select class="form-control" id="startingCredits" v-model="settings.player.startingCredits" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingCredits" v-bind:key="opt" v-bind:value="opt">
            ${{ opt }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
        <label for="startingCreditsSpecialists" class="col-form-label">Starting Specialist Tokens <help-tooltip tooltip="Determines how many specialist tokens each player is allocated at the start of the game"/></label>
        <select class="form-control" id="startingCreditsSpecialists" v-model="settings.player.startingCreditsSpecialists" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingCreditsSpecialists" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Tokens
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="startingShips" class="col-form-label">Starting Ships <help-tooltip tooltip="Determines how many ships the home star of each player is allocated at the start of the game"/></label>
        <select class="form-control" id="startingShips" v-model="settings.player.startingShips" :disabled="isCreatingGame">
          <option v-for="opt in options.player.startingShips" v-bind:key="opt" v-bind:value="opt">
            {{ opt }} Ships at each star
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Starting Infrastructure <help-tooltip tooltip="Determines the infrastructure of the home star of each player at the start of the game"/></label>
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
        <label for="economyCost" class="col-form-label">Development Cost <help-tooltip tooltip="Determines how expensive infrastructure costs to build"/></label>
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
        <label for="tradeCredits" class="col-form-label">Trade Credits <help-tooltip tooltip="Determines whether players can trade credits"/></label>
        <select class="form-control" id="tradeCredits" v-model="settings.player.tradeCredits" :disabled="isCreatingGame">
          <option v-for="opt in options.player.tradeCredits" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
        <label for="tradeCreditsSpecialists" class="col-form-label">Trade Specialist Tokens <help-tooltip tooltip="Determines whether players can trade specialist tokens"/></label>
        <select class="form-control" id="tradeCreditsSpecialists" v-model="settings.player.tradeCreditsSpecialists" :disabled="isCreatingGame">
          <option v-for="opt in options.player.tradeCreditsSpecialists" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="tradeCost" class="col-form-label">Technology Trade Cost <help-tooltip tooltip="Determines how expensive the technology trade fee costs"/></label>
        <select class="form-control" id="tradeCost" v-model="settings.player.tradeCost" :disabled="isCreatingGame">
          <option v-for="opt in options.player.tradeCost" v-bind:key="opt.value" v-bind:value="opt.value">
            <span v-if="opt.value > 0">{{ opt.text }} Trades ${{ opt.value}}/level</span>
            <span v-if="opt.value === 0">{{ opt.text }}</span>
          </option>
        </select>
      </div>

      <div class="form-group" v-if="settings.player.tradeCost > 0">
        <label for="tradeScanning" class="col-form-label">Trade Scanning <help-tooltip tooltip="If enabled, players can only trade with other players who are in their scanning range"/></label>
        <select class="form-control" id="tradeScanning" v-model="settings.player.tradeScanning" :disabled="isCreatingGame">
          <option v-for="opt in options.player.tradeScanning" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="alliances" class="col-form-label">Formal Alliances <help-tooltip tooltip="If enabled, players can change their diplomatic status to allied or enemies - Allied players can orbit eachother's stars and support eachother in combat"/></label>
        <select class="form-control" id="alliances" v-model="settings.player.alliances" :disabled="isCreatingGame">
          <option v-for="opt in options.player.alliances" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <view-subtitle title="Technology Settings"/>

      <div class="form-group">
        <label class="col-form-label">Starting Technology <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
        <select class="form-control" id="startingTechLevelTerraforming" v-model="settings.technology.startingTechnologyLevel.terraforming" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Terraforming
          </option>
        </select>
        <select class="form-control" id="startingTechLevelExperimentation" v-model="settings.technology.startingTechnologyLevel.experimentation" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevelWithDisabled" v-bind:key="opt" v-bind:value="opt">
            <span v-if="opt > 0">Level {{ opt }} Experimentation</span>
            <span v-if="opt === 0">Experimentation Disabled</span>
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
        <select class="form-control" id="startingTechLevelSpecialists" v-model="settings.technology.startingTechnologyLevel.specialists" :disabled="isCreatingGame" v-if="settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Specialists
          </option>
        </select>
        <select class="form-control" id="startingTechLevelBanking" v-model="settings.technology.startingTechnologyLevel.banking" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevelWithDisabled" v-bind:key="opt" v-bind:value="opt">
            <span v-if="opt > 0">Level {{ opt }} Banking</span>
            <span v-if="opt === 0">Banking Disabled</span>
          </option>
        </select>
        <select class="form-control" id="startingTechLevelWeapons" v-model="settings.technology.startingTechnologyLevel.weapons" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.startingTechnologyLevel" v-bind:key="opt" v-bind:value="opt">
            Level {{ opt }} Weapons
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="col-form-label">Research Costs <help-tooltip tooltip="Determines how many research points it takes to level up a technology"/></label>
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
        <select class="form-control" id="researchCostsTechSpecialists" v-model="settings.technology.researchCosts.specialists" :disabled="isCreatingGame" v-if="settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
          <option v-for="opt in options.technology.researchCosts" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }} Specialists Research
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="bankingReward" class="col-form-label">Banking Reward <help-tooltip tooltip="Determines the amount of credits awarded for the banking technology at the end of a galactic cycle"/></label>
        <select class="form-control" id="bankingReward" v-model="settings.technology.bankingReward" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.bankingReward" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="specialistTokenReward" class="col-form-label">Specialist Token Reward <help-tooltip tooltip="Determines the amount of specialist tokens awarded for the banking technology at the end of a galactic cycle"/></label>
        <select class="form-control" id="specialistTokenReward" v-model="settings.technology.specialistTokenReward" :disabled="isCreatingGame">
          <option v-for="opt in options.technology.specialistTokenReward" v-bind:key="opt.value" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>
      
      <button type="submit" class="btn btn-success btn-lg mb-3 btn-block" :disabled="isCreatingGame"><i class="fas fa-gamepad"></i> Create Game</button>

    </form>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import ViewSubtitle from '../components/ViewSubtitle'
import FormErrorList from '../components/FormErrorList'
import HelpTooltip from '../components/HelpTooltip'
import gameService from '../services/api/game'
import router from '../router'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle,
    'form-error-list': FormErrorList,
    'help-tooltip': HelpTooltip
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
