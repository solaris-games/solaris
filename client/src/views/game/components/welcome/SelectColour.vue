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
                        <button class="btn btn-success ms-1" @click="onJoinRequested(player)" v-if="!$isHistoricalMode() && player.isOpenSlot">Join</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
</div>
</template>

<script>
import gameHelper from '../../../../services/gameHelper'
import PlayerAvatarVue from '../menu/PlayerAvatar.vue'
import TeamName from '../shared/TeamName.vue';
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';

export default {
  components: {
    'team-name': TeamName,
    'player-avatar': PlayerAvatarVue
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      players: []
    }
  },
  mounted () {
    this.players = this.$store.state.game.galaxy.players
  },

  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    async onJoinRequested (player) {
      if (gameHelper.isNewPlayerGame(this.$store.state.game)) {
        await this.$confirm('Join Game', 'You are about to join a new player game, it will start when 2 players have joined the game. Good luck and have fun!', 'OK', 'Cancel', true)
      }

      this.$emit('onJoinRequested', player._id)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e._id)
    },
    panToPlayer (player) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: player });
    },
    getPlayerStatus (player) {
      return gameHelper.getPlayerStatus(player)
    }
  }
}
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
