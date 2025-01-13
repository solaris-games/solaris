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
import { inject } from 'vue'
import { eventBusInjectionKey } from '../../../../eventBus'
import PlayerEventBusEventNames from '../../../../eventBusEventNames/player'

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
  setup() {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  mounted () {
    this.loadLedger();
    this.eventBus.on(PlayerEventBusEventNames.PlayerDebtAdded, this.onPlayerDebtAdded);
    this.eventBus.on(PlayerEventBusEventNames.PlayerDebtForgiven, this.onPlayerDebtForgiven);
    this.eventBus.on(PlayerEventBusEventNames.PlayerDebtSettled, this.onPlayerDebtSettled);
  },
  unmounted () {
    this.eventBus.off(PlayerEventBusEventNames.PlayerDebtAdded, this.onPlayerDebtAdded);
    this.eventBus.off(PlayerEventBusEventNames.PlayerDebtForgiven, this.onPlayerDebtForgiven);
    this.eventBus.off(PlayerEventBusEventNames.PlayerDebtSettled, this.onPlayerDebtSettled);
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
