<template>
  <span>
    <i v-if="diplomaticStatus && diplomaticStatus.actualStatus === 'allies'" class="fas fa-handshake" title="This player is an ally"></i>
    <i v-if="diplomaticStatus && diplomaticStatus.actualStatus === 'neutral'" class="fas fa-dove" title="This player is neutral"></i>
    <i v-if="diplomaticStatus && diplomaticStatus.actualStatus === 'enemies'" class="fas fa-crosshairs" title="This player is an enemy"></i>
  </span>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import { ref, onMounted, computed, inject } from 'vue'
import type {DiplomaticStatus} from "@solaris-common";
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import {detailDiplomacy} from "@/services/typedapi/diplomacy";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const props = defineProps<{
  toPlayerId: string,
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const diplomaticStatus = ref<DiplomaticStatus<string> | null>(null);

const loadDiplomaticStatus = async () => {
  const userPlayer = GameHelper.getUserPlayer(game.value);

  if (!userPlayer || props.toPlayerId === userPlayer._id) {
    return;
  }

  const response = await detailDiplomacy(httpClient)(game.value._id, props.toPlayerId);
  if (isOk(response)) {
    diplomaticStatus.value = response.data;
  } else {
    console.error(formatError(response));
  }
};

onMounted(() => {
  loadDiplomaticStatus();
});
</script>

<style scoped>

</style>
