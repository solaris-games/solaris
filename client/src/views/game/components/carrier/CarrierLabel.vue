<template>
  <a href="javascript:;" @click="pan">{{actualCarrierName}}<i class="fas fa-eye ms-1"></i></a>
</template>

<script setup lang="ts">
import { onMounted, inject, ref } from 'vue';
import gameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";
import { useStore } from "vuex";
import type {MapObject} from "@solaris-common";

const props = defineProps<{
  carrierId: string,
  carrierName?: string,
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();

const actualCarrierName = ref('');

const pan = () => {
  const carrier = gameHelper.getCarrierById(store.state.game, props.carrierId);

  if (carrier) {
    eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: carrier as MapObject<string> });
  }
}

onMounted(() => {
  if (props.carrierName) {
    actualCarrierName.value = props.carrierName;
  } else {
    const carrier = gameHelper.getCarrierById(store.state.game, props.carrierId);

    actualCarrierName.value = carrier ? carrier.name : 'Unknown';
  }
});
</script>

<style scoped>
</style>
