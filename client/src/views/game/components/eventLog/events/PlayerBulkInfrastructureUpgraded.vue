<template>
  <div>
    <p>
      Your stars have been upgraded.
      You purchased <span class="text-warning">{{ props.event.data.upgradeReport.upgraded }}
        {{ props.event.data.upgradeReport.infrastructureType }}</span> for
      <span class="text-success">${{ props.event.data.upgradeReport.cost }}</span> credits.
    </p>
    <details>
      <summary class="upgrade-report-collapsible-summary">Upgrade report</summary>

      <bulk-infrastructure-upgrade-report
        :upgrade-report="props.event.data.upgradeReport"></bulk-infrastructure-upgrade-report>
    </details>
  </div>
</template>

<script setup lang="ts">

import type { PlayerBulkInfrastructureUpgradedEvent } from "@solaris-common";
import BulkInfrastructureUpgradeReport from "@/views/game/components/star/BulkInfrastructureUpgradeReport.vue";

const props = defineProps<{
  event: PlayerBulkInfrastructureUpgradedEvent<string>
}>();
</script>

<style scoped>
.upgrade-report-collapsible-summary {
  font-weight: bold;
}
</style>
