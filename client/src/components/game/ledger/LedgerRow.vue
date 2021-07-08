<template>
<tr>
  <td :style="{'width': '8px', 'background-color': getFriendlyColour(ledger.playerId)}"></td>
  <td class="col-avatar" :title="getPlayerAlias(ledger.playerId)">
    <player-avatar @onClick="onPlayerDetailRequested(ledger.playerId)" :player="getPlayer(ledger.playerId)"/>
  </td>
  <td class="pl-2 pt-3 pb-2">
    <h5 class="alias-title">{{getPlayerAlias(ledger.playerId)}}</h5>
  </td>
  <td class="fit pt-3 pr-4">
    <h5 :class="{'text-success':ledger.debt>0,'text-danger':ledger.debt<0}">${{ledger.debt}}</h5>
  </td>
  <td class="fit pt-2 pb-2 pr-2">
    <button class="btn btn-danger" :disabled="ledger.debt >= 0 || ledger.isSettlingDebt || isGameFinished" @click="settleDebt(ledger)" title="Settle Debt"><i class="fas fa-money-check-alt"></i></button>
    <button class="btn btn-success ml-1" :disabled="ledger.debt <= 0 || ledger.isForgivingDebt || isGameFinished" @click="forgiveDebt(ledger)" title="Forgive Debt"><i class="fas fa-hands-helping"></i></button>
  </td>
</tr>
</template>

<script>
import PlayerAvatarVue from '../menu/PlayerAvatar'
import LedgerApiService from '../../../services/api/ledger'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'player-avatar': PlayerAvatarVue
  },
  props: {
    'ledger': Object
  },
  methods: {
    getPlayer (playerId) {
      return gameHelper.getPlayerById(this.$store.state.game, playerId)
    },
    getPlayerAlias (playerId) {
      return this.getPlayer(playerId).alias
    },
    getFriendlyColour (playerId) {
      return gameHelper.getPlayerColour(this.$store.state.game, playerId)
    },
    onPlayerDetailRequested(playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    async forgiveDebt (ledger) {
      let playerAlias = this.getPlayerAlias(ledger.playerId)

      if (await this.$confirm('Forgive debt', `Are you sure you want to forgive the debt of $${ledger.debt} that ${playerAlias} owes you?`)) {
        try {
          ledger.isForgivingDebt = true

          let response = await LedgerApiService.forgiveDebt(this.$store.state.game._id, ledger.playerId)

          if (response.status === 200) {
            this.$toasted.show(`The debt ${playerAlias} owes you has been forgiven.`, { type: 'success' })
          }

          ledger.debt = response.data.debt
        } catch (err) {
          console.error(err)
        }

        ledger.isForgivingDebt = false
      }
    },
    async settleDebt (ledger) {
      let playerAlias = this.getPlayerAlias(ledger.playerId)

      if (await this.$confirm('Settle debt', `Are you sure you want to settle the debt of $${ledger.debt} that you owe to ${playerAlias}?`)) {
        try {
          ledger.isSettlingDebt = true

          let response = await LedgerApiService.settleDebt(this.$store.state.game._id, ledger.playerId)

          if (response.status === 200) {
            this.$toasted.show(`You have paid off debt that you owe to ${playerAlias}.`, { type: 'success' })
          }

          gameHelper.getUserPlayer(this.$store.state.game).credits -= Math.abs(ledger.debt)

          ledger.debt = response.data.debt
        } catch (err) {
          console.error(err)
        }

        ledger.isSettlingDebt = false
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
    padding-top: 0.25rem !important;
  }
}
</style>
