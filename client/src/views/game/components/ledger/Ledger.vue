<template>
<div class="menu-page container pb-2">
    <menu-title title="Ledger" @onCloseRequested="onCloseRequested"/>

    <p><small>Debts that you owe are in <span class="text-danger">red</span>. Use the <b>Settle Debt</b> button to send credits and settle the debt.</small></p>

    <p><small>Debts that are owed to you are in <span class="text-success">green</span>. Use the <b>Forgive Debt</b> button to write off the debt.</small></p>

    <loading-spinner :loading="isLoadingLedger"/>

    <!-- TODO: Convert this into a table component with a ledgerType property -->
    <!-- TODO: Display in tabs? Credits | Tokens -->
    <div v-if="!isLoadingLedger" class="row">
      <div class="table-responsive p-0" v-if="ledgers.length">
        <table class="table table-sm table-striped mb-0">
          <tbody>
            <ledger-row 
              v-for="ledger in ledgers" 
              :key="ledger.playerId" 
              :ledger="ledger"
              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
          </tbody>
        </table>
      </div>

      <p v-if="!ledgers.length" class="col text-warning">You have not traded with any other player and have no debts or credits.</p>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import LoadingSpinner from '../../../components/LoadingSpinner'
import LedgerApiService from '../../../../services/api/ledger'
import LedgerRowVue from './LedgerRow'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner,
    'ledger-row': LedgerRowVue
  },
  data () {
    return {
      isLoadingLedger: false,
      ledgers: []
    }
  },
  mounted () {
    this.loadLedgerCredits()
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
    onOpenPlayerDetailRequested(playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    async loadLedgerCredits () {
      try {
        this.isLoadingLedger = true

        let response = await LedgerApiService.getLedgerCredits(this.$store.state.game._id)

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
      // TODO: Check ledgerType here.
      this.loadLedgerCredits()
    },
    onPlayerDebtForgiven (e) {
      this.loadLedgerCredits()
    },
    onPlayerDebtSettled (e) {
      this.loadLedgerCredits()
    }
  }
}
</script>

<style scoped>
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
}
</style>
