<template>
<div class="menu-page container">
    <menu-title title="Ledger" @onCloseRequested="onCloseRequested"/>

    <p>Debts that you owe are in <span class="text-danger">red</span>. Use the <b>Settle Debt</b> button to send credits and settle the debt in full.</p>

    <p>Debts that are owed to you are in <span class="text-success">green</span>. Use the <b>Forgive Debt</b> button to write off the debt.</p>

    <loading-spinner :loading="isLoadingLedger"/>

    <div v-if="!isLoadingLedger" class="row">
        <div class="table-responsive" v-if="ledgers.length">
          <table class="table table-sm table-striped">
              <tbody>
                  <!--  v-bind:style="{'opacity':player.defeated ? 0.5: 1}" -->
                  <tr v-for="ledger in ledgers" :key="ledger.playerId">
                      <td :style="{'width': '8px', 'background-color': getFriendlyColour(ledger.playerId)}"></td>
                      <td class="col-avatar" :title="getPlayerAlias(ledger.playerId)">
                          <img v-if="getAvatarImage(ledger)" :src="getAvatarImage(ledger)">
                          <i v-if="!getAvatarImage(ledger)" class="far fa-user ml-2 mr-2 mt-2 mb-2" style="font-size:40px;"></i>
                      </td>
                      <td class="pl-2 pt-3 pb-2">
                          <!-- Text styling for defeated players? -->
                          <h5>{{getPlayerAlias(ledger.playerId)}}</h5>
                      </td>
                      <td class="fit pt-3 pr-4">
                          <h5 :class="{'text-success':ledger.debt>0,'text-danger':ledger.debt<0}">${{ledger.debt}}</h5>
                      </td>
                      <td class="fit pt-2 pb-2 pr-2">
                        <!-- <modalButton :disabled="ledger.debt <= 0" modalName="forgiveDebtModal" classText="btn btn-info">Forgive Debt</modalButton> -->
                          <button class="btn btn-danger" :disabled="ledger.debt >= 0 || ledger.isSettlingDebt" @click="settleDebt(ledger)" title="Settle Debt"><i class="fas fa-money-check-alt"></i></button>
                          <button class="btn btn-success ml-1" :disabled="ledger.debt <= 0 || ledger.isForgivingDebt" @click="forgiveDebt(ledger)" title="Forgive Debt"><i class="fas fa-hands-helping"></i></button>
                      </td>
                  </tr>
              </tbody>
          </table>
        </div>

        <p v-if="!ledgers.length" class="col text-warning">You have not traded with any other player and have no debts or credits.</p>
    </div>

    <!-- <dialogModal modalName="forgiveDebtModal" titleText="Forgive Debt" cancelText="No" confirmText="Yes" @onConfirm="forgiveDebt(selectedLedger)">
      <p>Are you sure you want to forgive the debt of <span class="text-success">${{selectedLedger.debt}}</span> that <b>{{getPlayerAlias(ledger.playerId)}}</b> owes you?</p>
    </dialogModal> -->
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import LoadingSpinner from '../../LoadingSpinner'
import LedgerApiService from '../../../services/api/ledger'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner
  },
  data () {
    return {
      userPlayer: null,
      isLoadingLedger: false,
      ledgers: []
    }
  },
  mounted () {
    this.loadLedger()

    this.userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
  },
  created () {
    this.sockets.subscribe('playerDebtAdded', this.onPlayerDebtAdded)
    this.sockets.subscribe('playerDebtForgiven', this.onPlayerDebtForgiven)
    this.sockets.subscribe('playerDebtSettled', this.onPlayerDebtSettled)
  },
  destroyed () {
    this.sockets.unsubscribe('playerDebtAdded')
    this.sockets.unsubscribe('playerDebtForgiven')
    this.sockets.unsubscribe('playerDebtSettled')
  },
  methods: {
    getPlayerAlias (playerId) {
      return gameHelper.getPlayerById(this.$store.state.game, playerId).alias
    },
    getFriendlyColour (playerId) {
      return gameHelper.getPlayerColour(this.$store.state.game, playerId)
    },
    async forgiveDebt (ledger) {
      let playerAlias = this.getPlayerAlias(ledger.playerId)

      if (confirm(`Are you sure you want to forgive the debt of $${ledger.debt} that ${playerAlias} owes you?`)) {
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

      if (confirm(`Are you sure you want to settle the debt of $${ledger.debt} that you owe to ${playerAlias}?`)) {
        try {
          ledger.isSettlingDebt = true

          let response = await LedgerApiService.settleDebt(this.$store.state.game._id, ledger.playerId)

          if (response.status === 200) {
            this.$toasted.show(`You have paid off debt that you owe to ${playerAlias}.`, { type: 'success' })
          }

          this.userPlayer.credits -= Math.abs(ledger.debt)

          ledger.debt = response.data.debt
        } catch (err) {
          console.error(err)
        }

        ledger.isSettlingDebt = false
      }
    },
    async loadLedger () {
      try {
        this.isLoadingLedger = true

        let response = await LedgerApiService.getLedger(this.$store.state.game._id)

        if (response.status === 200) {
          this.ledgers = response.data
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoadingLedger = false
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    // Below: Fuck it.
    onPlayerDebtAdded (e) {
      this.loadLedger()
    },
    onPlayerDebtForgiven (e) {
      this.loadLedger()
    },
    onPlayerDebtSettled (e) {
      this.loadLedger()
    },
    getAvatarImage (ledger) {
      let player = gameHelper.getPlayerById(this.$store.state.game, ledger.playerId)

      if (!player.avatar) {
        return null
      }
      
      return require(`../../../assets/avatars/${player.avatar}.png`)
    }
  }
}
</script>

<style scoped>
img {
    height: 55px;
}

.col-avatar {
    width: 55px;
    cursor: pointer;
}

.table-sm td {
    padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}
</style>
