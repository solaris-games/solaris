<template>
<div>
  <p>
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdFrom)">{{event.data.playerFromAlias}}</a>
    has changed their
    <strong>diplomatic status</strong>
    with
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdTo)">{{event.data.playerToAlias}}</a>
    to
    <span :class="getDiplomaticStatusClass(event.data.statusTo)">{{event.data.statusTo}}</span>.
  </p>
  <p>
    <small>The combined diplomatic status is now: <span :class="getDiplomaticStatusClass(event.data.actualStatus)">{{event.data.actualStatus}}</span></small>
  </p>
</div>
</template>

<script setup lang="ts">
import {type DiplomaticState, type PlayerDiplomacyStatusChangedEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerDiplomacyStatusChangedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const getDiplomaticStatusClass = (status: DiplomaticState) => {
  switch (status) {
    case 'enemies': return 'text-danger';
    case 'allies': return 'text-success';
    case 'neutral': return 'text-info';
  }
};
</script>

<style scoped>
</style>
