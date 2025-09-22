<template>
  <view-container :is-auth-page="true">
    <view-title title="Create Game" />
    <loading-spinner :loading="!settings || isCreatingGame"/>

    <select-template @onSelectTemplate="loadSettingsFromTemplate" />

    <form @submit.prevent="handleSubmit" v-if="settings">
      <view-collapse-panel title="Game Settings" :startsOpened="true">
        <div class="mb-2">
          <label for="name" class="col-form-label">Name <help-tooltip tooltip="The name of the game, make it short and sweet"/></label>
          <input type="text" :required="true" class="form-control" id="name" minlength="3" maxlength="24" v-model="settings.general.name" :disabled="isCreatingGame">
        </div>
        <div class="mb-2">
          <label for="description" class="col-form-label">Description <help-tooltip tooltip="Give your game a long description detailing some key settings and entice players to join your custom game"/></label>
          <textarea rows="4" class="form-control" id="description" v-model="settings.general.description"></textarea>
        </div>
        <div class="mb-2">
          <label for="password" class="col-form-label">Password <help-tooltip tooltip="Password protect your game for you and a select group of players"/></label>
          <input type="password" class="form-control" id="password" v-model="settings.general.password" :disabled="isCreatingGame">
        </div>

        <div class="mb-2">
          <label for="mode" class="col-form-label">Mode <help-tooltip tooltip="The game mode Conquest is victory by stars, Battle Royale is last man standing in a constantly shrinking galaxy, King of the Hill is a fight for a key star, Team Conquest is conquest, but with teams"/></label>
          <select class="form-control" id="mode" v-model="settings.general.mode" :disabled="isCreatingGame" @change="onModeChanged">
            <option v-for="opt in options.general.mode" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="(settings.general.mode === 'conquest') || (settings.general.mode === 'teamConquest')">
          <label for="conquestVictoryCondition" class="col-form-label">Victory Condition <help-tooltip tooltip="The victory condition in which a Conquest game will be decided."/></label>
          <select class="form-control" id="conquestVictoryCondition" v-model="settings.conquest.victoryCondition" :disabled="isCreatingGame">
            <option v-for="opt in options.conquest.victoryCondition" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="(settings.general.mode === 'conquest') || (settings.general.mode === 'teamConquest')">
          <label for="conquestVictoryPercentage" class="col-form-label">Stars For Victory <help-tooltip tooltip="How many stars are needed for a player to win the game"/></label>
          <select class="form-control" id="conquestVictoryPercentage" v-model="settings.conquest.victoryPercentage" :disabled="isCreatingGame">
            <option v-for="opt in options.conquest.victoryPercentage" v-bind:key="opt" v-bind:value="opt">
              {{ opt }}% of <span v-if="settings.conquest.victoryCondition === 'homeStarPercentage'">Capital</span> Stars
            </option>
          </select>

          <label for="conquestCapitalStarElimination" class="col-form-label">Capital Star Elimination <help-tooltip tooltip="Determines whether players become defeated if they lose control of their capital star"/></label>
          <select class="form-control" id="conquestCapitalStarElimination" v-model="settings.conquest.capitalStarElimination" :disabled="isCreatingGame">
            <option v-for="opt in options.conquest.capitalStarElimination" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.general.mode === 'teamConquest' && !isAdvancedCustomGalaxy">
          <label for="teamConquestTeamCount" class="col-form-label">Number of teams <help-tooltip tooltip="Determines how many teams the players will be split into" /></label>

          <p class="mb-1 text-warning" v-if="!(possibleTeamCounts.length || 0)">Warning: It's not possible to form equally sized teams with your current number of player slots.</p>

          <select v-if="(possibleTeamCounts.length || 0) > 0" class="form-control" id="teamConquestTeamCount" v-model="settings.conquest.teamsCount" @change="onTeamCountChanged" :disabled="isCreatingGame">
            <option v-for="opt in possibleTeamCounts" v-bind:key="opt" v-bind:value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.general.mode === 'kingOfTheHill'">
          <label for="kingOfTheHillProductionCycles" class="col-form-label">Countdown Cycles (<span class="text-warning">{{settings.kingOfTheHill.productionCycles}} production cycles</span>) <help-tooltip tooltip="How long the countdown is to the end of the game in production cycles when the center star is captured"/></label>
          <div class="col">
            <input type="range" min="1" max="25" step="1" class="form-range w-100" id="kingOfTheHillproductionCycles" v-model="settings.kingOfTheHill.productionCycles" :disabled="isCreatingGame">
          </div>
        </div>

        <form-error-list v-bind:errors="errors"/>

        <div class="d-grid gap-2 mb-3 mt-3">
          <button type="submit" class="btn btn-success btn-lg" :disabled="isCreatingGame"><i class="fas fa-gamepad"></i> Create Game</button>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Player Settings" :startsOpened="true">
        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="players" class="col-form-label">Players <help-tooltip tooltip="Total number of player slots"/></label>
          <select class="form-control" id="players" v-model="settings.general.playerLimit" :disabled="isCreatingGame" @change="onPlayerLimitChanged">
            <option v-for="opt in options.general.playerLimit" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Players
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="playerType" class="col-form-label">Player Type <help-tooltip tooltip="Determines what type of players can join the game"/></label>
          <select class="form-control" id="playerType" v-model="settings.general.playerType" :disabled="isCreatingGame">
            <option v-for="opt in options.general.playerType" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="anonymity" class="col-form-label">Anonymity <help-tooltip tooltip="Extra anonymity will hide player identities such as their Victories, Rank and Renown"/></label>
          <select class="form-control" id="anonymity" v-model="settings.general.anonymity" :disabled="isCreatingGame">
            <option v-for="opt in options.general.anonymity" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="playerOnlineStatus" class="col-form-label">Player Online Status <help-tooltip tooltip="Determines whether players can see who is online in real time"/></label>
          <select class="form-control" id="playerOnlineStatus" v-model="settings.general.playerOnlineStatus" :disabled="isCreatingGame">
            <option v-for="opt in options.general.playerOnlineStatus" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="playerIPWarning" class="col-form-label">Player IP Warning <help-tooltip tooltip="Show warnings when players use the same IP to prevent multiboxing. Only disable this if you are sure" /></label>
          <select class="form-control" id="playerIPWarning" v-model="settings.general.playerIPWarning" :disabled="isCreatingGame">
            <option v-for="opt in options.general.playerIPWarning" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="advancedAI" class="col-form-label">Advanced AI <help-tooltip tooltip="Use the advanced AI to replace defeated players"></help-tooltip></label>
          <select class="form-control" id="advancedAI" v-model="settings.general.advancedAI" :disabled="isCreatingGame">
            <option v-for="opt in options.general.advancedAI" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="spectators" class="col-form-label">Allow Spectators <help-tooltip tooltip="Allow players to invite users to spectate the game"></help-tooltip></label>
          <select class="form-control" id="spectators" v-model="settings.general.spectators" :disabled="isCreatingGame">
            <option v-for="opt in options.general.spectators" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="afkSlotsOpen" class="col-form-label">AFK slots are open <help-tooltip tooltip="Allow players to join into afk slots"></help-tooltip></label>
          <select class="form-control" id="afkSlotsOpen" v-model="settings.general.afkSlotsOpen" :disabled="isCreatingGame">
            <option v-for="opt in options.general.afkSlotsOpen" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="readyToQuit" class="col-form-label">Allow Ready To Quit <help-tooltip tooltip="Allow players to 'Ready To Quit' to finish games early"></help-tooltip></label>
          <select class="form-control" id="readyToQuit" v-model="settings.general.readyToQuit" :disabled="isCreatingGame">
            <option v-for="opt in options.general.readyToQuit" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div v-if="settings.general.readyToQuit === 'enabled'" class="mb-2">
          <label for="readyToQuitFraction" class="col-form-label">Fraction of stars for RTQ <help-tooltip tooltip="Fraction of stars for triggering RTQ condition"></help-tooltip></label>
          <select class="form-control" id="readyToQuitFraction" v-model="settings.general.readyToQuitFraction" :disabled="isCreatingGame">
            <option v-for="opt in options.general.readyToQuitFraction" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div v-if="settings.general.readyToQuit === 'enabled'" class="mb-2">
          <label for="readyToQuitTimerCycles" class="col-form-label">Timer for RTQ <help-tooltip tooltip="Time until game finishes after RTQ"></help-tooltip></label>
          <select class="form-control" id="readyToQuitTimerCycles" v-model="settings.general.readyToQuitTimerCycles" :disabled="isCreatingGame">
            <option v-for="opt in options.general.readyToQuitTimerCycles" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div v-if="settings.general.readyToQuit === 'enabled'" class="mb-2">
          <label for="readyToQuitVisibility" class="col-form-label">RTQ visibility <help-tooltip tooltip="Visibility of a player's RTQ state. Anonymous shows the number of RTQ'd players, but not their identity"></help-tooltip></label>

          <select class="form-control" id="readyToQuitVisibility" v-model="settings.general.readyToQuitVisibility" :disabled="isCreatingGame">
            <option v-for="opt in options.general.readyToQuitVisibility" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.general.mode !== 'teamConquest'">
          <label for="awardRankTo" class="col-form-label">Players that will receive rank <help-tooltip tooltip="Rank distribution scheme to be used" /></label>
          <select class="form-control" id="awardRankTo" v-model="settings.general.awardRankTo" :disabled="isCreatingGame">
            <option v-for="opt in options.general.awardRankTo" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.general.awardRankTo === 'top_n'">
          <label for="awardRankToTopN" class="col-form-label">Top/bottom <span class="text-warning">{{settings.general.awardRankToTopN}} players</span> will receive/lose rank <help-tooltip tooltip="Top N players will receive rank, and bottom N players will lose rank"/></label>
          <div class="col">
            <input type="range" min="1" :max="Math.floor(settings.general.playerLimit / 2)" step="1" class="form-range w-50" id="awardRankToTopN" v-model="settings.general.awardRankToTopN" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2">
          <label for="allowAbandonStars" class="col-form-label">Allow Abandon Stars <help-tooltip tooltip="Determines whether players are allowed to abandon stars"/></label>
          <select class="form-control" id="allowAbandonStars" v-model="settings.player.allowAbandonStars" :disabled="isCreatingGame">
            <option v-for="opt in options.player.allowAbandonStars" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Game Time Settings" :startsOpened="true">
        <div class="mb-2">
          <label for="gameType" class="col-form-label">Game Type <help-tooltip tooltip="Real time games are constantly running however Turn based games all players must submit their turn in order for the game to progress"/></label>
          <select class="form-control" id="gameType" v-model="settings.gameTime.gameType" :disabled="isCreatingGame">
            <option v-for="opt in options.gameTime.gameType" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.gameTime.gameType === 'realTime'">
          <label for="gameSpeed" class="col-form-label">Game Speed <help-tooltip tooltip="Determines how fast a single tick will take"/></label>
          <select class="form-control" id="gameSpeed" v-model="settings.gameTime.speed" :disabled="isCreatingGame">
            <option v-for="opt in options.gameTime.speed" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="isTickLimited" class="col-form-label">Time Limited <help-tooltip tooltip="Determines whether the game has a time limit"/></label>
          <select class="form-control" id="isTickLimited" v-model="settings.gameTime.isTickLimited" :disabled="isCreatingGame">
            <option v-for="opt in options.gameTime.isTickLimited" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.gameTime.isTickLimited === 'enabled'">
          <label for="tickLimit" class="col-form-label">Time Limit (<span class="text-warning">{{settings.gameTime.tickLimit}} ticks</span>) <help-tooltip tooltip="Determines the maximum number of ticks before the game is automatically concluded"/></label>
          <div class="col">
            <input type="range" min="100" max="2000" step="100" class="form-range w-100" id="tickLimit" v-model="settings.gameTime.tickLimit" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.gameTime.gameType === 'realTime'">
          <label for="startDelay" class="col-form-label">Start Delay <help-tooltip tooltip="Determines how long the warmup period is before games start, for large games it is recommended to have a long start delay"/></label>
          <select class="form-control" id="startDelay" v-model="settings.gameTime.startDelay" :disabled="isCreatingGame">
            <option v-for="opt in options.gameTime.startDelay" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.gameTime.gameType === 'turnBased'">
          <label for="turnJumps" class="col-form-label">Turn Jumps <help-tooltip tooltip="Determines how many ticks are processed for a single turn"/></label>
          <select class="form-control" id="turnJumps" v-model="settings.gameTime.turnJumps" :disabled="isCreatingGame">
            <option v-for="opt in options.gameTime.turnJumps" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.gameTime.gameType === 'turnBased'">
          <label for="maxTurnWait" class="col-form-label">Max Turn Wait <help-tooltip tooltip="The timeout period in which players have to take their turn, if the limit is reached then the turn will process regardless of whether players are ready or not"/></label>
          <select class="form-control" id="maxTurnWait" v-model="settings.gameTime.maxTurnWait" :disabled="isCreatingGame">
            <option v-for="opt in options.gameTime.maxTurnWait" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="lastSeenTimeout" class="col-form-label">AFK Last Seen Limit (<span class="text-warning">{{settings.gameTime.afk.lastSeenTimeout}} day(s)</span>) <help-tooltip tooltip="Determines how long before a player is kicked for being AFK - This is paired with the AFK Galactic Cycle Limit setting, the timeout is whichever comes first"/></label>
          <div class="col">
            <input type="range" min="1" max="7" step="1" class="form-range w-100" id="lastSeenTimeout" v-model="settings.gameTime.afk.lastSeenTimeout" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.gameTime.gameType === 'realTime'">
          <label for="cycleTimeout" class="col-form-label">AFK Galactic Cycle Limit (<span class="text-warning">{{settings.gameTime.afk.cycleTimeout}} cycles</span>) <help-tooltip tooltip="Determines how many cycles before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"/></label>
          <div class="col">
            <input type="range" min="3" max="25" step="1" class="form-range w-100" id="cycleTimeout" v-model="settings.gameTime.afk.cycleTimeout" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.gameTime.gameType === 'turnBased'">
          <label for="turnTimeout" class="col-form-label">AFK Missed Turn Limit (<span class="text-warning">{{settings.gameTime.afk.turnTimeout}} missed turn(s)</span>) <help-tooltip tooltip="Determines how many missed turns before a player is kicked before being AFK - This is paired with the AFK Last Seen Limit setting, the timeout is whichever comes first"/></label>
          <div class="col">
            <input type="range" min="1" max="60" step="1" class="form-range w-100" id="turnTimeout" v-model="settings.gameTime.afk.turnTimeout" :disabled="isCreatingGame">
          </div>
        </div>

      </view-collapse-panel>

      <view-subtitle title="Advanced Settings" class="centeredHeader"/>

      <view-collapse-panel title="Flux">
        <flux-bar />

        <div class="mb-2">
          <label for="fluxEnabled" class="col-form-label">Enabled <help-tooltip tooltip="Determines whether this month's flux is applied to the game"/></label>
          <select class="form-control" id="fluxEnabled" v-model="settings.general.fluxEnabled" :disabled="isCreatingGame">
            <option v-for="opt in options.general.fluxEnabled" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Galaxy Settings">
        <div class="mb-2">
          <label for="galaxyType" class="col-form-label">Galaxy Type <help-tooltip tooltip="The shape of the galaxy that will be generated for the game"/></label>
          <select class="form-control" id="galaxyType" v-model="settings.galaxy.galaxyType" :disabled="isCreatingGame">
            <option v-for="opt in options.galaxy.galaxyType" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType === 'irregular'">
          <label for="irregularGalaxyType" class="col-form-label">Custom seed for irregular galaxy <help-tooltip tooltip="The seed of irregular galaxy that will be generated for the game"/></label>
          <input type="text" class="form-control" id="mapSeed" v-model="settings.galaxy.customSeed" :disabled="isCreatingGame">
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType === 'custom'">
          <custom-galaxy :advanced="settings.galaxy.advancedCustomGalaxyEnabled === 'enabled'" v-model="settings.galaxy.customGalaxy" />
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType === 'custom'">
          <label for="advancedCustomGalaxyEnabled" class="col-form-label">Advanced Custom Galaxy <help-tooltip tooltip="If enabled, overrides the starting player, team, star and carrier settings with data provided in the JSON"/></label>
          <select class="form-control" id="advancedCustomGalaxyEnabled" v-model="settings.galaxy.advancedCustomGalaxyEnabled" :disabled="isCreatingGame">
            <option v-for="opt in options.galaxy.advancedCustomGalaxyEnabled" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="starsPerPlayer" class="col-form-label">Stars per Player (<span class="text-warning">{{settings.galaxy.starsPerPlayer}} stars</span>) <help-tooltip tooltip="How many stars will be generated per player in the galaxy"/></label>
          <div class="col">
            <input type="range" min="3" max="50" step="1" class="form-range w-100" id="starsPerPlayer" v-model="settings.galaxy.starsPerPlayer" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2">
          <label for="productionTicks" class="col-form-label">Production Ticks (<span class="text-warning">{{settings.galaxy.productionTicks}} ticks</span>) <help-tooltip tooltip="How many ticks are in a galactic cycle"/></label>
          <div class="col">
            <input type="range" min="10" max="36" step="2" class="form-range w-100" id="productionTicks" v-model="settings.galaxy.productionTicks" :disabled="isCreatingGame">
          </div>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Special Galaxy Settings">
        <div class="mb-2">
          <label for="carrierCost" class="col-form-label">Carrier Cost <help-tooltip tooltip="Determines how expensive carriers cost to build"/></label>
          <select class="form-control" id="carrierCost" v-model="settings.specialGalaxy.carrierCost" :disabled="isCreatingGame">
            <option v-for="opt in options.specialGalaxy.carrierCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Carriers
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="carrierUpkeepCost" class="col-form-label">Carrier Upkeep Cost <help-tooltip tooltip="Determines how expensive the carrier upkeep is - Upkeep is paid at the end of a galactic cycle"/></label>
          <select class="form-control" id="carrierUpkeepCost" v-model="settings.specialGalaxy.carrierUpkeepCost" :disabled="isCreatingGame">
            <option v-for="opt in options.specialGalaxy.carrierUpkeepCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="warpgateCost" class="col-form-label">Warpgate Cost <help-tooltip tooltip="Determines how expensive warp gates cost to build"/></label>
          <select class="form-control" id="warpgateCost" v-model="settings.specialGalaxy.warpgateCost" :disabled="isCreatingGame">
            <option v-for="opt in options.specialGalaxy.warpgateCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Gates
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="specialistCost" class="col-form-label">Specialist Cost <help-tooltip tooltip="Determines how expensive specialists cost to hire"/></label>
          <select class="form-control" id="specialistCost" v-model="settings.specialGalaxy.specialistCost" :disabled="isCreatingGame">
            <option v-for="opt in options.specialGalaxy.specialistCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }} Specialists
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.specialGalaxy.specialistCost !== 'none'">
          <label for="specialistsCurrency" class="col-form-label">Specialist Currency <help-tooltip tooltip="Determines the type of currency used to hire specialists"/></label>
          <select class="form-control" id="specialistsCurrency" v-model="settings.specialGalaxy.specialistsCurrency" :disabled="isCreatingGame">
            <option v-for="opt in options.specialGalaxy.specialistsCurrency" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="randomWarpGates" class="col-form-label">Random Warp Gates (<span class="text-warning">{{settings.specialGalaxy.randomWarpGates}}%</span>) <help-tooltip tooltip="The percentage of random warp gates are seeded at the start of the game - Warp gates increase carrier movement speed"/></label>
          <div class="col">
            <input type="range" min="0" max="50" step="1" class="form-range w-100" id="randomWarpGates" v-model="settings.specialGalaxy.randomWarpGates" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="randomWormHoles" class="col-form-label">Random Worm Holes (<span class="text-warning">{{settings.specialGalaxy.randomWormHoles}}%</span>) <help-tooltip tooltip="The percentage of random worm holes are generated in the galaxy - Worm holes provide instant travel between paired worm hole stars"/></label>
          <div class="col">
            <input type="range" min="0" max="50" step="1" class="form-range w-100" id="randomWormHoles" v-model="settings.specialGalaxy.randomWormHoles" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="randomNebulas" class="col-form-label">Random Nebulas (<span class="text-warning">{{settings.specialGalaxy.randomNebulas}}%</span>) <help-tooltip tooltip="The percentage of random nebulas are generated in the galaxy - Nebulas conceal the infrastructure and ship counts at the star from all other players"/></label>
          <div class="col">
            <input type="range" min="0" max="50" step="1" class="form-range w-100" id="randomNebulas" v-model="settings.specialGalaxy.randomNebulas" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="randomAsteroidFields" class="col-form-label">Random Asteroid Fields (<span class="text-warning">{{settings.specialGalaxy.randomAsteroidFields}}%</span>) <help-tooltip tooltip="The percentage of random asteroid fields are generated in the galaxy - Asteroid fields have +1 defender bonus (net +2 weapons) in combat"/></label>
          <div class="col">
            <input type="range" min="0" max="50" step="1" class="form-range w-100" id="randomAsteroidFields" v-model="settings.specialGalaxy.randomAsteroidFields" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="randomBinaryStars" class="col-form-label">Random Binary Stars (<span class="text-warning">{{settings.specialGalaxy.randomBinaryStars}}%</span>) <help-tooltip tooltip="The percentage of random binary stars are generated in the galaxy - Binary stars start with additional resources"/></label>
          <div class="col">
            <input type="range" min="0" max="50" step="1" class="form-range w-100" id="randomBinaryStars" v-model="settings.specialGalaxy.randomBinaryStars" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="randomBlackHoles" class="col-form-label">Random Black Holes (<span class="text-warning">{{settings.specialGalaxy.randomBlackHoles}}%</span>) <help-tooltip tooltip="The percentage of random black holes are generated in the galaxy - Black holes cannot have infrastructure but have +3 scanning range"/></label>
          <div class="col">
            <input type="range" min="0" max="50" step="1" class="form-range w-100" id="randomBlackHoles" v-model="settings.specialGalaxy.randomBlackHoles" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
          <label for="randomPulsars" class="col-form-label">Random Pulsars (<span class="text-warning">{{settings.specialGalaxy.randomPulsars}}%</span>) <help-tooltip tooltip="The percentage of random pulsars are generated in the galaxy - Pulsars are always visible to all players in the game"/></label>
          <div class="col">
            <input type="range" min="0" max="50" step="1" class="form-range w-100" id="randomPulsars" v-model="settings.specialGalaxy.randomPulsars" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2">

          <div class="mb-2">
            <label for="darkGalaxy" class="col-form-label">Dark Galaxy <help-tooltip tooltip="Dark galaxies hide stars outside of player scanning ranges - Extra dark galaxies hide player statistics so that players only know what other players have based on what they can see in their scanning range"/></label>
            <select class="form-control" id="darkGalaxy" v-model="settings.specialGalaxy.darkGalaxy" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.darkGalaxy" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2">
            <label for="giftCarriers" class="col-form-label">Gift Carriers <help-tooltip tooltip="Determines whether carriers can be gifted to other players"/></label>
            <select class="form-control" id="giftCarriers" v-model="settings.specialGalaxy.giftCarriers" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.giftCarriers" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2">
            <label for="defenderBonus" class="col-form-label">Defender Bonus <help-tooltip tooltip="Enables or disables the defender bonus - Grants +1 to the defender in carrier-to-star combat"/></label>
            <select class="form-control" id="defenderBonus" v-model="settings.specialGalaxy.defenderBonus" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.defenderBonus" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2" v-if="settings.orbitalMechanics.enabled === 'disabled'">
            <label for="carrierToCarrierCombat" class="col-form-label">Carrier-to-Carrier Combat <help-tooltip tooltip="Determines whether carrier-to-carrier combat is enabled. If disabled, carriers will not fight each other in space"/></label>
            <select class="form-control" id="carrierToCarrierCombat" v-model="settings.specialGalaxy.carrierToCarrierCombat" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.carrierToCarrierCombat" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
            <label for="splitResources" class="col-form-label">Split Resources <help-tooltip tooltip="Determines whether star natural resources are independent values, giving the game more granular infrastructure costs"/></label>
            <select class="form-control" id="splitResources" v-model="settings.specialGalaxy.splitResources" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.splitResources" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
            <label for="resourceDistribution" class="col-form-label">Resource Distribution <help-tooltip tooltip="Determines the shape of distributed natural resources in the galaxy"/></label>
            <select class="form-control" id="resourceDistribution" v-model="settings.specialGalaxy.resourceDistribution" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.resourceDistribution" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2" v-if="settings.galaxy.galaxyType !== 'custom'">
            <label for="playerDistribution" class="col-form-label">Player Distribution <help-tooltip tooltip="Determines where player home stars are located at the start of the game"/></label>
            <select class="form-control" id="playerDistribution" v-model="settings.specialGalaxy.playerDistribution" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.playerDistribution" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2">
            <label for="carrierSpeed" class="col-form-label">Carrier Speed <help-tooltip tooltip="Carriers go brrr"/></label>
            <select class="form-control" id="carrierSpeed" v-model="settings.specialGalaxy.carrierSpeed" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.carrierSpeed" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>

          <div class="mb-2">
            <label for="starCaptureReward" class="col-form-label">Star Capture Rewards <help-tooltip tooltip="Determines whether economic infrastructure is destroyed on star capture and if the attacker is awarded cash for destroying them"/></label>
            <select class="form-control" id="starCaptureReward" v-model="settings.specialGalaxy.starCaptureReward" :disabled="isCreatingGame">
              <option v-for="opt in options.specialGalaxy.starCaptureReward" v-bind:key="opt.value" v-bind:value="opt.value">
                {{ opt.text }}
              </option>
            </select>
          </div>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Orbital Mechanics">
        <p class="mb-1 text-warning" v-if="settings.orbitalMechanics.enabled === 'enabled'">Warning: carrier-to-carrier combat is auto-disabled in orbital games.</p>

        <div class="mb-2">
          <label for="orbitalMechanicsEnabled" class="col-form-label">Galaxy Rotation <help-tooltip tooltip="If enabled, orbits stars and carriers around the center of the galaxy every tick"/></label>
          <select class="form-control" id="orbitalMechanicsEnabled" v-model="settings.orbitalMechanics.enabled" :disabled="isCreatingGame">
            <option v-for="opt in options.orbitalMechanics.enabled" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.orbitalMechanics.enabled === 'enabled'">
          <label for="orbitSpeed" class="col-form-label">Orbit Speed <help-tooltip tooltip="Determines how fast stars and carriers orbit"/></label>
          <select class="form-control" id="orbitSpeed" v-model="settings.orbitalMechanics.orbitSpeed" :disabled="isCreatingGame">
            <option v-for="opt in options.orbitalMechanics.orbitSpeed" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Player Start Settings">
        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingStars" class="col-form-label">Starting Stars (<span class="text-warning">{{settings.player.startingStars}} stars</span>) <help-tooltip tooltip="Determines how many stars each player is allocated at the start of the game"/></label>
          <div class="col">
            <input type="range" min="1" max="30" step="1" class="form-range w-100" id="startingStars" v-model="settings.player.startingStars" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingCredits" class="col-form-label">Starting Credits (<span class="text-warning">{{settings.player.startingCredits}} credits</span>) <help-tooltip tooltip="Determines how many credits each player is allocated at the start of the game"/></label>
          <div class="col">
            <input type="range" min="25" max="3000" step="25" class="form-range w-100" id="startingCredits" v-model="settings.player.startingCredits" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists' && !isAdvancedCustomGalaxy">
          <label for="startingCreditsSpecialists" class="col-form-label">Starting Specialist Tokens (<span class="text-warning">{{settings.player.startingCreditsSpecialists}} tokens</span>) <help-tooltip tooltip="Determines how many specialist tokens each player is allocated at the start of the game"/></label>
          <div class="col">
            <input type="range" min="0" max="100" step="1" class="form-range w-100" id="startingCreditsSpecialists" v-model="settings.player.startingCreditsSpecialists" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingShips" class="col-form-label">Starting Ships (<span class="text-warning">{{settings.player.startingShips}} ships at each star</span>) <help-tooltip tooltip="Determines how many ships the home star of each player is allocated at the start of the game"/></label>
          <div class="col">
            <input type="range" min="0" max="100" step="1" class="form-range w-100" id="startingShips" v-model="settings.player.startingShips" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2">
          <label for="tradeCredits" class="col-form-label">Trade Credits <help-tooltip tooltip="Determines whether players can trade credits"/></label>
          <select class="form-control" id="tradeCredits" v-model="settings.player.tradeCredits" :disabled="isCreatingGame">
            <option v-for="opt in options.player.tradeCredits" v-bind:key="opt.value.toString()" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'">
          <label for="tradeCreditsSpecialists" class="col-form-label">Trade Specialist Tokens <help-tooltip tooltip="Determines whether players can trade specialist tokens"/></label>
          <select class="form-control" id="tradeCreditsSpecialists" v-model="settings.player.tradeCreditsSpecialists" :disabled="isCreatingGame">
            <option v-for="opt in options.player.tradeCreditsSpecialists" v-bind:key="opt.value.toString()" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="tradeCost" class="col-form-label">Technology Trade Cost <help-tooltip tooltip="Determines how expensive the technology trade fee costs"/></label>
          <select class="form-control" id="tradeCost" v-model="settings.player.tradeCost" :disabled="isCreatingGame">
            <option v-for="opt in options.player.tradeCost" v-bind:key="opt.value" v-bind:value="opt.value">
              <span v-if="opt.value > 0">{{ opt.text }} Trades ${{ opt.value}}/level</span>
              <span v-if="opt.value === 0">{{ opt.text }}</span>
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.player.tradeCost > 0">
          <label for="tradeScanning" class="col-form-label">Trade Scanning <help-tooltip tooltip="If enabled, players can only trade with other players who are in their scanning range"/></label>
          <select class="form-control" id="tradeScanning" v-model="settings.player.tradeScanning" :disabled="isCreatingGame">
            <option v-for="opt in options.player.tradeScanning" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Ship Population Cap">
        <div class="mb-2">
          <label for="populationCapEnabled" class="col-form-label">Enabled <help-tooltip tooltip="If enabled, the maximum ship population per player will be restricted"/></label>
          <select class="form-control" id="populationCapEnabled" v-model="settings.player.populationCap.enabled" :disabled="isCreatingGame">
            <option v-for="opt in options.player.populationCap.enabled" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.player.populationCap.enabled === 'enabled'">
          <label for="populationCapShipsPerStar" class="col-form-label">Ships Per Star (<span class="text-warning">{{settings.player.populationCap.shipsPerStar}} Ships</span>) <help-tooltip tooltip="Determines the max population of ships per star"/></label>
          <div class="col">
            <input type="range" min="50" max="1000" step="50" class="form-range w-100" id="startingTechLevelSpecialists" v-model="settings.player.populationCap.shipsPerStar" :disabled="isCreatingGame">
          </div>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Formal Alliances">
        <p class="mb-2 text-warning" v-if="settings.general.mode === 'teamConquest'">Some diplomacy settings are unavailable because Team Conquest is selected as a game mode.</p>
        <div class="mb-2" v-if="settings.general.mode !== 'teamConquest'">
          <label for="diplomacy" class="col-form-label">Enabled <help-tooltip tooltip="If enabled, players can change their diplomatic status to allied or enemies - Allied players can orbit each other's stars and support each other in combat"/></label>
          <select class="form-control" id="diplomacy" v-model="settings.diplomacy.enabled" :disabled="isCreatingGame">
            <option v-for="opt in options.diplomacy.enabled" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="mb-2" v-if="settings.diplomacy.enabled === 'enabled' && settings.general.mode !== 'teamConquest'">
          <label for="alliancesLocked" class="col-form-label">Locked Alliances<help-tooltip tooltip="If enabled, alliances cannot be canceled."/></label>
           <select class="form-control" id="alliancesLocked" v-model="settings.diplomacy.lockedAlliances" :disabled="isCreatingGame"  @change="onMaxAllianceTriggerChanged">
             <option v-for="opt in options.diplomacy.lockedAlliances.filter(o => !(o.value === 'enabled' && settings!.general.playerLimit <= 2))" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="mb-2" v-if="settings.diplomacy.enabled === 'enabled' && settings.general.mode !== 'teamConquest'">
          <label for="maxAlliances" class="col-form-label">Max Number of Alliances (<span class="text-warning">{{settings.diplomacy.maxAlliances}} Allies</span>) <help-tooltip tooltip="Determines how many formal alliance each player may have at once."/></label>
          <div class="col">
            <input type="range" min="1" :max="calcMaxAllianceLimit()" step="1" class="form-range w-100" id="maxAlliances" v-model="settings.diplomacy.maxAlliances" :disabled="isCreatingGame">
          </div>
        </div>
        <div class="mb-2" v-if="settings.diplomacy.enabled === 'enabled'">
          <label for="allianceUpkeepCost" class="col-form-label">Alliance Upkeep Cost <help-tooltip tooltip="Determines how expensive the alliance upkeep is - Upkeep is paid at the end of a galactic cycle"/></label>
          <select class="form-control" id="allianceUpkeepCost" v-model="settings.diplomacy.upkeepCost" :disabled="isCreatingGame">
            <option v-for="opt in options.diplomacy.upkeepCost" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="mb-2" v-if="settings.diplomacy.enabled === 'enabled'">
          <label for="allianceTradeRestricted" class="col-form-label">Alliance Only Trading <help-tooltip tooltip="If enabled, only allies can trade with each other."/></label>
           <select class="form-control" id="allianceTradeRestricted" v-model="settings.diplomacy.tradeRestricted" :disabled="isCreatingGame">
            <option v-for="opt in options.diplomacy.tradeRestricted" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="mb-2" v-if="settings.diplomacy.enabled === 'enabled' && settings.general.mode !== 'teamConquest'">
          <label for="alliancesGlobalEvents" class="col-form-label">Global Events <help-tooltip tooltip="If enabled, global events will be displayed when players declare war or make peace"/></label>
          <select class="form-control" id="alliancesGlobalEvents" v-model="settings.diplomacy.globalEvents" :disabled="isCreatingGame">
            <option v-for="opt in options.diplomacy.globalEvents" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Infrastructure Settings">
        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingInfrastructureEconomy" class="col-form-label">Starting Economic Infrastructure (<span class="text-warning">{{settings.player.startingInfrastructure.economy}} Economy</span>) <help-tooltip tooltip="Determines the infrastructure of the home star of each player at the start of the game"/></label>
          <div class="col">
            <input type="range" min="0" max="30" step="1" class="form-range w-100" id="startingInfrastructureEconomy" v-model="settings.player.startingInfrastructure.economy" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingInfrastructureIndustry" class="col-form-label">Starting Industrial Infrastructure (<span class="text-warning">{{settings.player.startingInfrastructure.industry}} Industry</span>) <help-tooltip tooltip="Determines the infrastructure of the home star of each player at the start of the game"/></label>
          <div class="col">
            <input type="range" min="0" max="30" step="1" class="form-range w-100" id="startingInfrastructureIndustry" v-model="settings.player.startingInfrastructure.industry" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingInfrastructureScience" class="col-form-label">Starting Scientific Infrastructure (<span class="text-warning">{{settings.player.startingInfrastructure.science}} Science</span>) <help-tooltip tooltip="Determines the infrastructure of the home star of each player at the start of the game"/></label>
          <div class="col">
            <input type="range" min="0" max="5" step="1" class="form-range w-100" id="startingInfrastructureScience" v-model="settings.player.startingInfrastructure.science" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2">
          <label for="economyCost" class="col-form-label">Development Cost <help-tooltip tooltip="Determines how expensive infrastructure costs to build. If disabled, then one third of all stars will start with the starting infrastructure"/></label>
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
      </view-collapse-panel>

      <view-collapse-panel title="Technology Settings">
        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelTerraforming" class="col-form-label">Starting Terraforming Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.terraforming}} Terraforming</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="1" max="16" step="1" class="form-range w-100" id="startingTechLevelTerraforming" v-model="settings.technology.startingTechnologyLevel.terraforming" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelExperimentation" class="col-form-label">Starting Experimentation Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.experimentation > 0 ? settings.technology.startingTechnologyLevel.experimentation : 'Disabled'}} Experimentation</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="0" max="16" step="1" class="form-range w-100" id="startingTechLevelExperimentation" v-model="settings.technology.startingTechnologyLevel.experimentation" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelScanning" class="col-form-label">Starting Scanning Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.scanning}} Scanning</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="1" max="16" step="1" class="form-range w-100" id="startingTechLevelScanning" v-model="settings.technology.startingTechnologyLevel.scanning" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelHyperspace" class="col-form-label">Starting Hyperspace Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.hyperspace}} Hyperspace</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="1" max="16" step="1" class="form-range w-100" id="startingTechLevelHyperspace" v-model="settings.technology.startingTechnologyLevel.hyperspace" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelManufacturing" class="col-form-label">Starting Manufacturing Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.manufacturing}} Manufacturing</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="1" max="16" step="1" class="form-range w-100" id="startingTechLevelManufacturing" v-model="settings.technology.startingTechnologyLevel.manufacturing" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelSpecialists" class="col-form-label">Starting Specialists Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.specialists}} Specialists</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="1" max="16" step="1" class="form-range w-100" id="startingTechLevelSpecialists" v-model="settings.technology.startingTechnologyLevel.specialists" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelBanking" class="col-form-label">Starting Banking Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.banking > 0 ? settings.technology.startingTechnologyLevel.banking : 'Disabled'}} Banking</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="0" max="16" step="1" class="form-range w-100" id="startingTechLevelBanking" v-model="settings.technology.startingTechnologyLevel.banking" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2" v-if="!isAdvancedCustomGalaxy">
          <label for="startingTechLevelWeapons" class="col-form-label">Starting Weapons Technology (<span class="text-warning">{{settings.technology.startingTechnologyLevel.weapons}} Weapons</span>) <help-tooltip tooltip="Determines the starting technology levels for all players"/></label>
          <div class="col">
            <input type="range" min="1" max="16" step="1" class="form-range w-100" id="startingTechLevelWeapons" v-model="settings.technology.startingTechnologyLevel.weapons" :disabled="isCreatingGame">
          </div>
        </div>

        <div class="mb-2">
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

        <div class="mb-2">
          <label for="researchProgression" class="col-form-label">Research Cost Progression <help-tooltip tooltip="Determines the growth of research points needed for the next level of technology"/></label>
          <select class="form-control" id="researchProgression" v-model="settings.technology.researchCostProgression.progression" :disabled="isCreatingGame">
            <option v-for="opt in options.technology.researchCostProgression" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.technology.researchCostProgression && settings.technology.researchCostProgression.progression === 'exponential'">
          <label for="researchProgression" class="col-form-label">Exponential growth factor <help-tooltip tooltip="Determines the speed of exponential growth"/></label>
          <select class="form-control" id="researchProgression" v-model="settings.technology.researchCostProgression.growthFactor" :disabled="isCreatingGame">
            <option v-for="opt in options.technology.researchCostProgressionGrowthFactor" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="bankingReward" class="col-form-label">Banking Reward <help-tooltip tooltip="Determines the amount of credits awarded for the banking technology at the end of a galactic cycle"/></label>
          <select class="form-control" id="bankingReward" v-model="settings.technology.bankingReward" :disabled="isCreatingGame">
            <option v-for="opt in options.technology.bankingReward" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.technology.startingTechnologyLevel.experimentation > 0">
          <label for="experimentationDistribution" class="col-form-label">Experimentation Distribution <help-tooltip tooltip="Determines to what technologies the experimentation reward gets distributed"/></label>

          <select class="form-control" id="experimentationDistribution" v-model="settings.technology.experimentationDistribution" :disabled="isCreatingGame">
            <option v-for="opt in options.technology.experimentationDistribution" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2" v-if="settings.technology.startingTechnologyLevel.experimentation > 0">
          <label for="experimentationReward" class="col-form-label">Experimentation Reward <help-tooltip tooltip="Determines the amount of research points awarded for the experimentation technology at the end of a galactic cycle"/></label>
          <select class="form-control" id="experimentationReward" v-model="settings.technology.experimentationReward" :disabled="isCreatingGame">
            <option v-for="opt in options.technology.experimentationReward" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="specialistTokenReward" class="col-form-label">Specialist Token Reward <help-tooltip tooltip="Determines the amount of specialist tokens awarded for the specialist technology at the end of a galactic cycle"/></label>
          <select class="form-control" id="specialistTokenReward" v-model="settings.technology.specialistTokenReward" :disabled="isCreatingGame">
            <option v-for="opt in options.technology.specialistTokenReward" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </view-collapse-panel>

      <view-collapse-panel title="Specialist Bans" v-if="settings.specialGalaxy.specialistCost !== 'none'">
        <div class="mb-2">
          <p><small>Choose to ban certain specialists from the game, they cannot be hired by any player.</small></p>
          <specialist-ban-list-selection :specialist-bans="settings.specialGalaxy.specialistBans" @updateSpecialistBans="bans => settings!.specialGalaxy.specialistBans = bans" />
        </div>
      </view-collapse-panel>

      <form-error-list v-bind:errors="errors"/>

      <div class="d-grid gap-2 mb-3 mt-3">
        <button type="submit" class="btn btn-success btn-lg" :disabled="isCreatingGame"><i class="fas fa-gamepad"></i> Create Game</button>
      </div>
    </form>
  </view-container>
</template>

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import ViewCollapsePanel from '../components/ViewCollapsePanel.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ViewSubtitle from '../components/ViewSubtitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import HelpTooltip from '../components/HelpTooltip.vue'
import SpecialistBanListSelection from './components/specialist/SpecialistBanListSelection.vue'
import FluxBar from './components/menu/FluxBar.vue'
import gameService from '../../services/api/game'
import router from '../../router'
import SelectTemplate from "@/views/game/gameCreation/SelectTemplate.vue";
import { ref, onMounted, inject, type Ref, computed } from 'vue';
import {GAME_CREATION_OPTIONS, type GameSettingsSpec, type SpecialistBans} from "@solaris-common";
import {createGame} from "@/services/typedapi/game";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import CustomGalaxy from "@/views/game/gameCreation/CustomGalaxy.vue";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const isCreatingGame = ref(false);
const errors: Ref<string[]> = ref([]);
const settings: Ref<GameSettingsSpec | null> = ref(null);

const isAdvancedCustomGalaxy = computed(() => settings.value && settings.value.galaxy.galaxyType === 'custom' && settings.value.galaxy.advancedCustomGalaxyEnabled === 'enabled');

const options = GAME_CREATION_OPTIONS;

const possibleTeamCounts: Ref<number[]> = ref([]);

const loadSettingsFromTemplate = async (templateName: string) => {
  const template = await import(`../../config/gamesettings/${templateName}.json`);
  settings.value = JSON.parse(JSON.stringify(template)); // deep clone
};

const validateTeamSettings = () => {
  if (settings.value!.general.mode !== 'teamConquest') {
    return;
  }

  const players = settings.value!.general.playerLimit;
  const teams = settings.value!.conquest.teamsCount;

  const numberValid = players && teams && players >= 4 && players % teams === 0;

  if (!numberValid) {
    errors.value.push('The number of players must be larger than 3 and divisible by the number of teams.');
  }
};

const updatePossibleTeamCounts = () => {
  if (settings.value!.general.mode !== 'teamConquest') {
    return;
  }

  const players = settings.value!.general.playerLimit;

  if (players < 4) {
    return [];
  }

  const upperBound = Math.ceil(players / 2);
  const teams: number[] = [];

  for (let i = 2; i <= upperBound; i++) {
    if (players % i === 0) {
      teams.push(i);
    }
  }

  if (teams.length) {
    settings.value!.conquest.teamsCount = teams[0];
  }

  possibleTeamCounts.value = teams;
}

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  errors.value = [];

  if (!settings.value!.general.name) {
    errors.value.push('Game name required.')
  }

  validateTeamSettings();

  if (errors.value.length) {
    return;
  }

  isCreatingGame.value = true

  const response = await createGame(httpClient)(settings.value!);

  if (isOk(response)) {
    toast.success(`The game ${settings.value!.general.name} has been created.`)

    router.push({ name: 'game-detail', query: { id: response.data.gameId } })
  }

  isCreatingGame.value = false;
};

const calcMaxAllianceLimit = () => {
  if (settings.value!.general.mode === 'teamConquest') {
    const playersPerTeam = settings.value!.general.playerLimit / settings.value!.conquest.teamsCount!;
    return playersPerTeam - 1;
  }

  return settings.value!.general.playerLimit - 1 - (settings.value!.diplomacy.lockedAlliances === 'enabled' ? 1 : 0)
};

const onMaxAllianceTriggerChanged = () => {
  updatePossibleTeamCounts();
  settings.value!.diplomacy.maxAlliances = calcMaxAllianceLimit();
  console.warn("Max alliances changed to: " + settings.value!.diplomacy.maxAlliances);
};

const onModeChanged = () => {
  if (settings.value!.general.mode === 'teamConquest') {
    settings.value!.diplomacy.enabled = 'enabled';
    settings.value!.diplomacy.lockedAlliances = 'enabled';
    console.warn("Mode changed to team conquest, enabling diplomacy and locked alliances.")
    onMaxAllianceTriggerChanged();
  }
};

const onSpecialistBanSelectionChanged = (e: SpecialistBans) => {
  settings.value!.specialGalaxy.specialistBans = e;
};

const onPlayerLimitChanged = () => {
  if (settings.value!.general.playerLimit <= 2) {
    settings.value!.diplomacy.lockedAlliances = 'disabled';
  }

  onMaxAllianceTriggerChanged();
};

const onTeamCountChanged = () => {
  settings.value!.diplomacy.maxAlliances = calcMaxAllianceLimit();
};

onMounted(async () => {
  try {
    const response = await gameService.getDefaultGameSettings();

    settings.value = response.data.settings;
  } catch (err) {
    console.error(err)
  }
});
</script>

<style scoped>
.centeredHeader {
  text-align: center;
  margin-top: 1rem;
}
</style>
