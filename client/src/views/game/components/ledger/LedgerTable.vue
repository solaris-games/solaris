<template>
<div>
    <loading-spinner :loading="isLoadingLedger"/>

    <div v-if="!isLoadingLedger" class="row">
      <div class="table-responsive p-0" v-if="ledgers.length">
        <table class="table table-sm table-striped mb-0">
          <tbody>
            <ledger-row
              v-for="ledger in ledgers"
              :key="ledger.playerId"
              :ledger="ledger"
              :ledgerType="ledgerType"
              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
          </tbody>
        </table>
      </div>

      <p v-if="!ledgers.length" class="col text-warning">You have not traded with any other player and have no debts or credits.</p>
    </div>
</div>
</template>

<script>
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import LedgerApiService from '../../../../services/api/ledger'
import LedgerRowVue from './LedgerRow.vue'

export default {
  components: {
    'loading-spinner': LoadingSpinner,
    'ledger-row': LedgerRowVue
  },
  props: {
    ledgerType: String
  },
  data () {
    return {
      isLoadingLedger: false,
      ledgers: []
    }
  },
  mounted () {
    this.loadLedger()
  },
  created () {
    this.$socket.subscribe('playerDebtAdded', this.onPlayerDebtAdded)
    this.$socket.subscribe('playerDebtForgiven', this.onPlayerDebtForgiven)
    this.$socket.subscribe('playerDebtSettled', this.onPlayerDebtSettled)
  },
  unmounted () {
    this.$socket.unsubscribe('playerDebtAdded')
    this.$socket.unsubscribe('playerDebtForgiven')
    this.$socket.unsubscribe('playerDebtSettled')
  },
  methods: {
    onOpenPlayerDetailRequested(playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    async loadLedger () {
      try {
        this.isLoadingLedger = true

        let response = this.ledgerType === 'credits' ?
          await LedgerApiService.getLedgerCredits(this.$store.state.game._id) :
          await LedgerApiService.getLedgerCreditsSpecialists(this.$store.state.game._id)

        if (response.status === 200) {
          this.ledgers = response.data
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoadingLedger = false
    },
    // Below: Fuck it.
    onPlayerDebtAdded (e) {
      if (e.ledgerType === this.ledgerType) {
        this.loadLedger()
      }
    },
    onPlayerDebtForgiven (e) {
      if (e.ledgerType === this.ledgerType) {
        this.loadLedger()
      }
    },
    onPlayerDebtSettled (e) {
      if (e.ledgerType === this.ledgerType) {
        this.loadLedger()
      }
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
