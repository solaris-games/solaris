<template>
<tr>
  <td :style="{'width': '8px', 'background-color': getFriendlyColour(diplomaticStatus.playerIdTo)}"></td>
  <td class="col-avatar" :title="getPlayerAlias(diplomaticStatus.playerIdTo)">
    <player-avatar @onClick="onOpenPlayerDetailRequested(diplomaticStatus.playerIdTo)" :player="getPlayer(diplomaticStatus.playerIdTo)"/>
  </td>
  <td class="ps-2 pt-3 pb-2">
    <h5 class="alias-title">{{getPlayerAlias(diplomaticStatus.playerIdTo)}}</h5>
  </td>
  <td class="fit pt-3 pe-1">
    <diplomacy-icons
      :statusFrom="diplomaticStatus.statusFrom"
      :statusTo="diplomaticStatus.statusTo"
      :actualStatus="diplomaticStatus.actualStatus"/>
  </td>
  <td class="fit pt-3 pb-2 pe-2" v-if="!isGameFinished">
    <div class="btn-group">
      <button class="btn btn-sm" :class="{'btn-success':diplomaticStatus.statusTo === 'allies', 'btn-outline-success':diplomaticStatus.statusTo !== 'allies'}" @click="declareAlly(diplomaticStatus)" title="Declare this player an ally"><i class="fas fa-handshake"></i></button>
      <button class="btn btn-sm" :class="{'btn-info':diplomaticStatus.statusTo === 'neutral', 'btn-outline-info':diplomaticStatus.statusTo !== 'neutral'}" @click="declareNeutral(diplomaticStatus)" title="Declare this player as neutral"><i class="fas fa-dove"></i></button>
      <button class="btn btn-sm" :class="{'btn-danger':diplomaticStatus.statusTo === 'enemies', 'btn-outline-danger':diplomaticStatus.statusTo !== 'enemies'}" @click="declareEnemy(diplomaticStatus)" title="Declare this player as an enemy"><i class="fas fa-crosshairs"></i></button>
    </div>
  </td>
</tr>
</template>

<script>
import PlayerAvatarVue from '../menu/PlayerAvatar.vue'
import DiplomacyApiService from '../../../../services/api/diplomacy'
import gameHelper from '../../../../services/gameHelper'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import DiplomacyIconsVue from './DiplomacyIcons.vue'

export default {
  components: {
    'player-avatar': PlayerAvatarVue,
    'diplomacy-icons': DiplomacyIconsVue
  },
  props: {
    'diplomaticStatus': Object
  },
  methods: {
    getPlayer (playerId) {
      return gameHelper.getPlayerById(this.$store.state.game, playerId)
    },
    getPlayerAlias (playerId) {
      return this.getPlayer(playerId).alias
    },
    getFriendlyColour (playerId) {
      return this.$store.getters.getColourForPlayer(playerId).value
    },
    onOpenPlayerDetailRequested(playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    async declareAlly (diplomaticStatus) {
      const userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
      let playerAlias = this.getPlayerAlias(diplomaticStatus.playerIdTo)
      let allianceFee = 0
      let cycleCredits = gameHelper.calculateIncome(this.$store.state.game, userPlayer);

      if (DiplomacyHelper.isAllianceUpkeepEnabled(this.$store.state.game)) {
        allianceFee = DiplomacyHelper.getAllianceUpkeepCost(this.$store.state.game, userPlayer, cycleCredits, 1)

        if (!await this.$confirm('Alliance Fee', `Allying with this player will cost you $${allianceFee} credits, are you sure you want to continue?`)) {
          return
        }
      }

      if (this.$store.state.game.settings.diplomacy.lockedAlliances === 'enabled') {
        if (!await this.$confirm('Permanent Alliance', 'If you form an alliance in this game, you will not be able to cancel it.')) {
          return
        }
      }

      if (await this.$confirm('Declare Allies', `Are you sure you want to change your diplomatic status to ${playerAlias} to allied?`)) {
        try {
          let response = await DiplomacyApiService.declareAlly(this.$store.state.game._id, diplomaticStatus.playerIdTo)

          if (response.status === 200) {
            if (response.data.statusTo == 'allies') {
              this.$toast.success(`Your diplomatic status to ${playerAlias} is now allied.`)
            } else {
              this.$toast.error(`You can not ally ${playerAlias}. Check the maximum alliance limits.`)
            }

            diplomaticStatus.statusFrom = response.data.statusFrom
            diplomaticStatus.statusTo = response.data.statusTo
            diplomaticStatus.actualStatus = response.data.actualStatus

            userPlayer.credits -= allianceFee

            this.$emit('onApiRequestSuccess')
          } else {
            this.$emit('onApiRequestError', response.data)
          }
        } catch (err) {
          console.error(err)
          this.$emit('onApiRequestError', err.response.data)
        }
      }
    },
    async declareEnemy (diplomaticStatus) {
      let playerAlias = this.getPlayerAlias(diplomaticStatus.playerIdTo)

      if (await this.$confirm('Declare Enemy', `Are you sure you want to change your diplomatic status to ${playerAlias} to enemies?`)) {
        try {
          let response = await DiplomacyApiService.declareEnemy(this.$store.state.game._id, diplomaticStatus.playerIdTo)

          if (response.status === 200) {
            this.$toast.success(`Your diplomatic status to ${playerAlias} is now enemies.`)

            diplomaticStatus.statusFrom = response.data.statusFrom
            diplomaticStatus.statusTo = response.data.statusTo
            diplomaticStatus.actualStatus = response.data.actualStatus

            this.$emit('onApiRequestSuccess')
          } else {
            this.$emit('onApiRequestError', response.data)
          }
        } catch (err) {
          console.error(err)
          this.$emit('onApiRequestError', err.response.data)
        }
      }
    },
    async declareNeutral (diplomaticStatus) {
      let playerAlias = this.getPlayerAlias(diplomaticStatus.playerIdTo)

      if (await this.$confirm('Declare Neutral', `Are you sure you want to change your diplomatic status to ${playerAlias} to neutral?`)) {
        try {
          let response = await DiplomacyApiService.declareNeutral(this.$store.state.game._id, diplomaticStatus.playerIdTo)

          if (response.status === 200) {
            this.$toast.success(`Your diplomatic status to ${playerAlias} is now neutral.`)

            diplomaticStatus.statusFrom = response.data.statusFrom
            diplomaticStatus.statusTo = response.data.statusTo
            diplomaticStatus.actualStatus = response.data.actualStatus

            this.$emit('onApiRequestSuccess')
          } else {
            this.$emit('onApiRequestError', response.data)
          }
        } catch (err) {
          console.error(err)
          this.$emit('onApiRequestError', err.response.data)
        }
      }
    }
  },
  computed: {
    isGameFinished: function () {
      return gameHelper.isGameFinished(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
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

tr {
  height: 59px;
}

td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

@media screen and (max-width: 576px) {
  tr {
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
