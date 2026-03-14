<template>
<div v-if="player && !isOnline && onlineStatus" class="row bg-dark">
  <div class="col pt-1 pb-1 mt-0 mb-0">
    <p class="mb-0 mt-0">
      <small><i class="fas fa-eye"></i> Online {{onlineStatus}}</small>
    </p>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper'
import type {Player} from "@/types/game";

const props = defineProps<{
  player: Player
}>();

const isOnline = ref(false);
const onlineStatus = ref('');

const recalculateOnlineStatus = () => {
  isOnline.value = GameHelper.isPlayerOnline(props.player);
  onlineStatus.value = GameHelper.getOnlineStatus(props.player);
};

onMounted(() => {
  const intervalHandle = setInterval(recalculateOnlineStatus, 1000);
  recalculateOnlineStatus();

  onUnmounted(() => {
    clearInterval(intervalHandle);
  });
});
</script>

<style scoped>

</style>
