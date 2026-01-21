<template>
<div v-if="player">
  <p>
    You have sent a carrier gift <carrier-label :carrierId="event.data.carrierId" :carrierName="event.data.carrierName"/> of <span class="text-warning">{{event.data.carrierShips}} ships</span> to <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a> at <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
  </p>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import StarLabel from '../../star/StarLabel.vue'
import CarrierLabel from '../../carrier/CarrierLabel.vue'
import GameHelper from '../../../../../services/gameHelper'
import type {PlayerGiftSentEvent} from "@solaris-common";
import type {Game} from "@/types/game";

const props = defineProps<{
  event: PlayerGiftSentEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.toPlayerId);

const store = useStore();
const game = computed<Game>(() => store.state.game);

const player = computed(() => GameHelper.getPlayerById(game.value, props.event.data.toPlayerId)!)
</script>

<style scoped>
</style>
