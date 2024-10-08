<template>
<tr>
  <td :style="{'width': '8px', 'background-color': getFriendlyColour(ledger.playerId)}"></td>
  <td class="col-avatar" :title="getPlayerAlias(ledger.playerId)">
    <player-avatar @onClick="onOpenPlayerDetailRequested(ledger.playerId)" :player="getPlayer(ledger.playerId)"/>
  </td>
  <td class="ps-2 pt-3 pb-2">
    <h5 class="alias-title">{{getPlayerAlias(ledger.playerId)}}</h5>
  </td>
  <td class="fit pt-3 pe-4">
    <h5 :class="{'text-success':ledger.debt>0,'text-danger':ledger.debt<0}">{{getFormattedDebtValue()}}</h5>
  </td>
  <td class="fit pt-2 pb-2 pe-2">
    <button class="btn btn-danger" :class="{'btn-outline-danger':!canSettleDebt}" :disabled="!canSettleDebt" @click="settleDebt(ledger)" title="Settle your debt to this player"><i class="fas fa-money-check-alt"></i></button>
    <button class="btn btn-success ms-1" :class="{'btn-outline-success':!canForgiveDebt}" :disabled="!canForgiveDebt" @click="forgiveDebt(ledger)" title="Forgive this player's debt to you"><i class="fas fa-hands-helping"></i></button>
  </td>
</tr>
</template>

<script>
import PlayerAvatarVue from '../menu/PlayerAvatar.vue'
import LedgerApiService from '../../../../services/api/ledger'
import gameHelper from '../../../../services/gameHelper'

export default {
  components: {
    'player-avatar': PlayerAvatarVue
  },
  props: {
    'ledger': Object,
    'ledgerType': String
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
    async forgiveDebt (ledger) {
      let playerAlias = this.getPlayerAlias(ledger.playerId)

      if (await this.$confirm('Forgive debt', `Are you sure you want to forgive the debt of ${this.getFormattedDebtValue(true)} that ${playerAlias} owes you?`)) {
        try {
          ledger.isForgivingDebt = true

          let response = this.ledgerType === 'credits' ?
            await LedgerApiService.forgiveDebtCredits(this.$store.state.game._id, ledger.playerId) :
            await LedgerApiService.forgiveDebtCreditsSpecialists(this.$store.state.game._id, ledger.playerId)

          if (response.status === 200) {
            this.$toast.success(`The debt ${playerAlias} owes you has been forgiven.`)
          }

          ledger.debt = response.data.ledger.debt
        } catch (err) {
          console.error(err)
        }

        ledger.isForgivingDebt = false
      }
    },
    async settleDebt (ledger) {
      let playerAlias = this.getPlayerAlias(ledger.playerId)

      if (await this.$confirm('Settle debt', `Are you sure you want to settle the debt of ${this.getFormattedDebtValue(true)} that you owe to ${playerAlias}?`)) {
        try {
          ledger.isSettlingDebt = true

          const isCredits = this.ledgerType === 'credits'

          let response = isCredits ?
            await LedgerApiService.settleDebtCredits(this.$store.state.game._id, ledger.playerId) :
            await LedgerApiService.settleDebtCreditsSpecialists(this.$store.state.game._id, ledger.playerId)

          if (response.status === 200) {
            this.$toast.success(`You have paid off debt that you owe to ${playerAlias}.`)
          }

          if (isCredits) {
            gameHelper.getUserPlayer(this.$store.state.game).ledger.credits -= Math.abs(ledger.debt)
          } else {
            gameHelper.getUserPlayer(this.$store.state.game).ledger.creditsSpecialists -= Math.abs(ledger.debt)
          }

          ledger.debt = response.data.ledger.debt;
        } catch (err) {
          console.error(err)
        }

        ledger.isSettlingDebt = false
      }
    },
    getFormattedDebtValue(withText = false) {
      if (this.ledgerType === 'credits') {
        return `$${this.ledger.debt}`
      }

      return `${this.ledger.debt}${withText ? ' specialist token(s)' : ''}`
    }
  },
  computed: {
    isGameFinished: function () {
      return gameHelper.isGameFinished(this.$store.state.game)
    },
    canSettleDebt () {
      return this.ledger.debt < 0 && !this.ledger.isSettlingDebt && !this.isGameFinished
    },
    canForgiveDebt () {
      return this.ledger.debt > 0 && !this.ledger.isForgivingDebt && !this.isGameFinished
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
