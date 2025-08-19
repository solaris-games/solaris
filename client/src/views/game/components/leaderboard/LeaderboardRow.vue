<template>
  <tr>
    <td :style="{'width': '8px', 'background-color': playerColourSpec.value}"></td>
    <td class="col-avatar" :title="playerColourSpec.alias + ' ' + player.shape">
      <player-avatar :player="player" @onClick="onOpenPlayerDetailRequested(player)"/>
    </td>
    <td class="ps-2 pt-3 pb-0">
      <!-- Text styling for defeated players? -->
      <h5 class="alias-title">
        {{ player.alias }}
        <team-name v-if="shouldShowTeamNames" :player-id="player._id"/>
        <span v-if="isKingOfTheHillMode && player.isKingOfTheHill" title="This player is the king of the hill">
          <i class="fas fa-crown"></i>
        </span>
        <span v-if="player.defeated" :title="getPlayerStatus(player)">
          <i v-if="!player.afk" class="fas fa-skull-crossbones" title="This player has been defeated"></i>
          <i v-if="player.afk" class="fas fa-user-clock" title="This player is AFK"></i>
        </span>
        <span v-if="canReadyToQuit && player.readyToQuit" @click="unconfirmReadyToQuit(player)">
          <i class="fas fa-check text-warning"
             title="This player is ready to quit - Ends the game early if all active players are ready to quit"></i>
        </span>
      </h5>
    </td>
    <td class="fit pt-3 pe-2" v-if="isStarCountWinCondition || isKingOfTheHillMode">
      <span class="d-xs-block d-sm-none">
        <i class="fas fa-star me-0"></i> {{ player.stats.totalStars }}
      </span>
      <span class="d-none d-sm-block">
        {{ player.stats.totalStars }} Star<span v-if="player.stats.totalStars !== 1">s</span>
      </span>
    </td>
    <td class="fit pt-3 pe-2" v-if="isHomeStarsWinCondition">
      <span class="d-xs-block d-sm-none">
        <i class="fas fa-star me-0"></i> {{ player.stats.totalHomeStars }}({{ player.stats.totalStars }})
      </span>
      <span class="d-none d-sm-block">
        {{ player.stats.totalHomeStars }}({{ player.stats.totalStars }}) Star<span v-if="player.stats.totalStars !== 1">s</span>
      </span>
    </td>
    <td class="pt-2 pb-2 pe-1 text-center turn-status" v-if="isTurnBasedGame && canEndTurn">
      <h5 v-if="player.ready && !isUserPlayer(player)" class="pt-2 pe-2 ps-2">
        <i class="fas fa-check text-success" title="This player has completed their turn"></i>
      </h5>

      <ready-status-button
        v-if="!$isHistoricalMode() && getUserPlayer() && isUserPlayer(player) && !getUserPlayer().defeated"/>
    </td>
    <td class="fit pt-2 pb-2 pe-2">
      <button class="btn btn-outline-info" @click="panToPlayer(player)"><i class="fas fa-eye"></i></button>
    </td>
  </tr>
</template>

<script>
import TeamName from '@/views/game/components/shared/TeamName.vue';
import PlayerAvatarVue from '@/views/game/components/menu/PlayerAvatar.vue';
import ReadyStatusButtonVue from '@/views/game/components/menu/ReadyStatusButton.vue';
import GameHelper from '@/services/gameHelper';
import gameService from '@/services/api/game';
import {eventBusInjectionKey} from "@/eventBus";
import { inject } from 'vue';
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'team-name': TeamName,
    'player-avatar': PlayerAvatarVue,
    'ready-status-button': ReadyStatusButtonVue,
  },
  props: {
    player: Object,
    showTeamNames: Boolean,
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  methods: {
    getFriendlyColour(colour) {
      return GameHelper.getFriendlyColour(colour)
    },
    onOpenPlayerDetailRequested(e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    getPlayerStatus(player) {
      return GameHelper.getPlayerStatus(player)
    },
    async unconfirmReadyToQuit(player) {
      if (!this.isUserPlayer(player) || this.$isHistoricalMode()) {
        return
      }

      try {
        let response = await gameService.unconfirmReadyToQuit(this.$store.state.game._id)

        if (response.status === 200) {
          player.readyToQuit = false
        }
      } catch (err) {
        console.error(err)
      }
    },
    getUserPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    isUserPlayer(player) {
      let userPlayer = this.getUserPlayer()

      return userPlayer && userPlayer._id === player._id
    },
    panToPlayer(player) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: player });
      this.onOpenPlayerDetailRequested(player._id);
    }
  },
  computed: {
    isKingOfTheHillMode() {
      return GameHelper.isKingOfTheHillMode(this.$store.state.game)
    },
    canReadyToQuit() {
      return this.$store.state.game.settings.general.readyToQuit === 'enabled'
        && this.$store.state.game.state.startDate
        && this.$store.state.game.state.productionTick
    },
    isHomeStarsWinCondition() {
      return GameHelper.isWinConditionHomeStars(this.$store.state.game)
    },
    isStarCountWinCondition() {
      return GameHelper.isWinConditionStarCount(this.$store.state.game)
    },
    isTurnBasedGame() {
      return this.$store.state.game.settings.gameTime.gameType === 'turnBased'
    },
    canEndTurn() {
      return !GameHelper.isGameFinished(this.$store.state.game)
    },
    shouldShowTeamNames () {
      return this.showTeamNames && GameHelper.isTeamConquest(this.$store.state.game)
    },
    playerColourSpec () {
      return this.$store.getters.getColourForPlayer(this.player._id)
    }
  }
}
</script>


<style scoped>
.col-avatar {
  position: absolute;
  width: 59px;
  height: 59px;
  cursor: pointer;
  padding: 0;
}

.alias-title {
  padding-left: 59px;
}

tr {
  height: 59px;
}

td {
  padding: 0;
}

.fa-check {
  cursor: pointer;
}

.turn-status {
  width: 70px;
}

@media screen and (max-width: 576px) {
  tr {
    height: 45px;
  }

  .alias-title {
    padding-left: 40px;
  }

  .col-avatar {
    width: 35px;
    height: 35px;
  }
}
</style>
