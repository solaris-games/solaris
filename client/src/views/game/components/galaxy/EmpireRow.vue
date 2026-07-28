<template>
  <tr :class="{ defeated: empire.defeated }">
    <td><player-icon :playerId="empire._id" /></td>
    <td>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{
        empire.alias
      }}</a>
    </td>
    <td>
      <a href="javascript:;" @click="goToEmpire"><i class="far fa-eye"></i></a>
    </td>
    <td class="text-end">{{ empire.stats!.totalStars }}</td>
    <td class="text-end">{{ empire.stats!.totalCarriers }}</td>
    <td class="text-end">{{ empire.stats!.totalSpecialists }}</td>
    <td class="text-end">{{ empire.stats!.totalShips }}</td>
    <td class="text-end">{{ empire.stats!.newShips }}</td>
    <td class="text-end text-success">{{ empire.stats!.totalEconomy }}</td>
    <td class="text-end text-warning">{{ empire.stats!.totalIndustry }}</td>
    <td class="text-end text-info">{{ empire.stats!.totalScience }}</td>
  </tr>
</template>

<script setup lang="ts">
import PlayerIcon from "../player/PlayerIcon.vue";
import { MapCommandEventBusEventNames } from "@solaris/map-rendering";
import { eventBusInjectionKey } from "../../../../eventBus";
import { inject } from "vue";
import type { Player } from "@/types/game";

const props = defineProps<{
  empire: Player;
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string];
}>();

const eventBus = inject(eventBusInjectionKey)!;

const onOpenPlayerDetailRequested = (e) =>
  emit("onOpenPlayerDetailRequested", props.empire._id);

const goToEmpire = (e) =>
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, {
    player: props.empire,
  });
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

.defeated {
  opacity: 0.5;
}
</style>
