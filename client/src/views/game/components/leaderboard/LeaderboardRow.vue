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
        <i class="fas fa-star me-0"></i> {{ player.stats!.totalStars }}
      </span>
      <span class="d-none d-sm-block">
        {{ player.stats!.totalStars }} Star<span v-if="player.stats!.totalStars !== 1">s</span>
      </span>
    </td>
    <td class="fit pt-3 pe-2" v-if="isHomeStarsWinCondition">
      <span class="d-xs-block d-sm-none">
        <i class="fas fa-star me-0"></i> {{ player.stats!.totalHomeStars }}({{ player.stats!.totalStars }})
      </span>
      <span class="d-none d-sm-block">
        {{ player.stats!.totalHomeStars }}({{ player.stats!.totalStars }}) Star<span v-if="player.stats!.totalStars !== 1">s</span>
      </span>
    </td>
    <td class="pt-2 pb-2 pe-1 text-center turn-status" v-if="isTurnBasedGame && canEndTurn">
      <h5 v-if="player.ready && !isUserPlayer(player)" class="pt-2 pe-2 ps-2">
        <i class="fas fa-check text-success" title="This player has completed their turn"></i>
      </h5>

      <ready-status-button
        v-if="!isHistoricalMode && getUserPlayer() && isUserPlayer(player) && !getUserPlayer()?.defeated"/>
    </td>
    <td class="fit pt-2 pb-2 pe-2">
      <button class="btn btn-outline-info" @click="panToPlayer(player)"><i class="fas fa-eye"></i></button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import TeamName from '@/views/game/components/shared/TeamName.vue';
import PlayerAvatar from '@/views/game/components/menu/PlayerAvatar.vue';
import ReadyStatusButton from '@/views/game/components/menu/ReadyStatusButton.vue';
import GameHelper from '@/services/gameHelper';
import {eventBusInjectionKey} from "@/eventBus";
import { inject, computed } from 'vue';
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import type { Player } from '@/types/game';
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import { notReadyToQuit } from '@/services/typedapi/game';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';

const props = defineProps<{
  player: Player,
  showTeamNames: boolean,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store: Store<State> = useStore();

const isHistoricalMode = useIsHistoricalMode(store);

const playerColourSpec = computed(() => {
  return store.getters.getColourForPlayer(props.player._id);
});

const shouldShowTeamNames = computed(() => {
  return props.showTeamNames && GameHelper.isTeamConquest(store.state.game);
});

const isTurnBasedGame = computed(() => {
  return store.state.game.settings.gameTime.gameType === 'turnBased';
});

const isKingOfTheHillMode = computed(() => {
  return GameHelper.isKingOfTheHillMode(store.state.game);
});

const canEndTurn = computed(() => {
  return !GameHelper.isGameFinished(store.state.game);
});

const canReadyToQuit = computed(() => {
  return store.state.game.settings.general.readyToQuit === 'enabled'
    && store.state.game.state.startDate
    && store.state.game.state.productionTick;
});

const isStarCountWinCondition = computed(() => {
  return GameHelper.isWinConditionStarCount(store.state.game);
});

const isHomeStarsWinCondition = computed(() => {
  return GameHelper.isWinConditionHomeStars(store.state.game);
});

const getUserPlayer = () => {
  return GameHelper.getUserPlayer(store.state.game);
};

const isUserPlayer = (player: Player) => {
  const userPlayer = getUserPlayer();

  return userPlayer && userPlayer._id === player._id;
};

const getPlayerStatus = (player: Player) => {
  return GameHelper.getPlayerStatus(player);
};

const onOpenPlayerDetailRequested = (e: Player) => {
  emit('onOpenPlayerDetailRequested', e._id);
};

const unconfirmReadyToQuit = async (player: Player) => {
  if (!isUserPlayer(player) || isHistoricalMode.value) {
    return;
  }

  const response = await notReadyToQuit(httpClient)(store.state.game._id);
  if (isOk(response)) {
    player.readyToQuit = false;
  } else {
    console.error(formatError(response));
  }
};

const panToPlayer = (player: Player) => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: player });
  onOpenPlayerDetailRequested(player);
};
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
