<template>
<div v-if="player">
  <p>
    You have received a carrier gift <carrier-label :carrierId="event.data.carrierId" :carrierName="event.data.carrierName"/> of <span class="text-warning">{{event.data.carrierShips}} ships</span> from <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a> at <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
  </p>
</div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';
import StarLabel from '../../star/StarLabel.vue'
import CarrierLabel from '../../carrier/CarrierLabel.vue'
import GameHelper from '../../../../../services/gameHelper'
import type {PlayerGiftReceivedEvent} from "@solaris-common";
import type {Game} from "@/types/game";

const props = defineProps<{
  event: PlayerGiftReceivedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.fromPlayerId);

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const player = computed(() => GameHelper.getPlayerById(game.value, props.event.data.fromPlayerId)!)
</script>

<style scoped>
</style>
