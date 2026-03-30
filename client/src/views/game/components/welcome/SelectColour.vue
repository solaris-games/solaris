<template>
<div>
  <div class="row text-center bg-dark">
    <div class="col">
      <p class="mb-0 mt-2 mb-2 small text-warning">Remember to abide by the <router-link class="guidelines-link" :to="{ name: 'guidelines' }">Community Guidelines</router-link></p>
    </div>
  </div>

  <div class="row text-center">
        <div class="col">
          <p class="mb-0 mt-2 mb-2">Select a colour and starting location.</p>
        </div>
    </div>

    <div class="row">
      <div class="table-responsive p-0">
        <table class="table table-sm table-striped">
            <tbody>
                <tr v-for="player in players" v-bind:key="player._id">
                    <td :style="{'width': '8px', 'background-color': getFriendlyColour(player.colour.value)}"></td>
                    <td class="col-avatar" :title="player.colour.alias + ' ' + player.shape" @click="onOpenPlayerDetailRequested(player)">
                        <player-avatar :player="player"/>
                    </td>
                    <td class="ps-2 pt-3 pb-2">
                        <h5 class="alias-title" style="vertical-align: middle;">
                          {{player.alias}}
                          <span v-if="player.defeated" :title="getPlayerStatus(player)">
                            <i v-if="!player.afk" class="fas fa-skull-crossbones" title="This player has been defeated"></i>
                            <i v-if="player.afk" class="fas fa-user-clock" title="This player is AFK"></i>
                          </span>
                          <team-name :player-id="player._id" />
                        </h5>
                    </td>
                    <td class="fit ps-2 pt-2 pb-2 pe-2">
                        <button class="btn btn-outline-info" @click="panToPlayer(player)"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-success ms-1" @click="onJoinRequested(player)" v-if="!isHistoricalMode && player.isOpenSlot">Join</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import gameHelper from '../../../../services/gameHelper'
import PlayerAvatar from '../menu/PlayerAvatar.vue'
import TeamName from '../shared/TeamName.vue';
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject, computed } from 'vue';
import { useStore } from 'vuex';
import type {Game, Player} from "@/types/game";
import GameHelper from "../../../../services/gameHelper";
import {useConfirm} from "@/hooks/confirm.ts";
import {useIsHistoricalMode} from "@/util/reactiveHooks.ts";

const emit = defineEmits<{
  onJoinRequested: [playerId: string],
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();
const confirm = useConfirm();
const isHistoricalMode = useIsHistoricalMode(store);
const game = computed<Game>(() => store.game);
const players = computed(() => game.value.galaxy.players);

const getFriendlyColour = (colour: string) => GameHelper.getFriendlyColour(colour);

const panToPlayer = (player: Player) => eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: player });

const getPlayerStatus = (player: Player) => GameHelper.getPlayerStatus(player);

const onOpenPlayerDetailRequested = (player: Player) => emit('onOpenPlayerDetailRequested', player._id);

const onJoinRequested = async (player: Player) => {
  if (gameHelper.isNewPlayerGame(game.value)) {
    await confirm('Join Game', 'You are about to join a new player game, it will start when 2 players have joined the game. Good luck and have fun!', 'OK', 'Cancel', true)
  }

  emit('onJoinRequested', player._id);
};
</script>

<style scoped>
img {
    height: 55px;
}

.col-avatar {
  position:absolute;
  width: 59px;
  height: 59px;
  cursor: pointer;
  padding: 0;
}

.alias-title {
  padding-left: 59px;
}

table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }

  .alias-title {
    padding-left: 45px;
  }

  .col-avatar {
    width: 45px;
  }
}
</style>
