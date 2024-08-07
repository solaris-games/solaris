<template>
<div class="menu-page container pb-2">
    <menu-title title="Ledger" @onCloseRequested="onCloseRequested"/>

    <p><small>Debts that you owe are in <span class="text-danger">red</span>. Use the <b>Settle Debt</b> button to send credits and settle the debt.</small></p>

    <p><small>Debts that are owed to you are in <span class="text-success">green</span>. Use the <b>Forgive Debt</b> button to write off the debt.</small></p>

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="tab" href="#credits">Credits</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#tokens">Tokens</a>
      </li>
    </ul>

    <div class="tab-content pt-2">
      <div class="tab-pane fade show active" id="credits">
        <ledger-table :ledgerType="'credits'" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
      </div>
      <div class="tab-pane fade" id="tokens">
        <ledger-table :ledgerType="'creditsSpecialists'" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
      </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import LedgerTableVue from './LedgerTable'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner,
    'ledger-table': LedgerTableVue
  },
  methods: {
    onOpenPlayerDetailRequested(playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
