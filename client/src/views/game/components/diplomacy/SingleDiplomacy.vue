<template>
  <diplomacy-toggle
    v-if="diplomaticStatus"
    :diplomatic-status="diplomaticStatus"
  />
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted } from "vue";
import DiplomacyToggle from "@/views/game/components/diplomacy/DiplomacyToggle.vue";
import type { DiplomaticStatus } from "@solaris/common";
import { httpInjectionKey } from "@/services/http.ts";
import { detailDiplomacy } from "@solaris/api-client/diplomacy.ts";
import { useGameStore } from "@/stores/game.ts";
import type { Game } from "@/types/game.ts";
import { formatError, isOk } from "@solaris/api-client";

const props = defineProps<{
  playerId: string;
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const diplomaticStatus = ref<DiplomaticStatus<string> | null>(null);

const loadDiplomaticStatus = async () => {
  const response = await detailDiplomacy(httpClient)(
    game.value._id,
    props.playerId,
  );

  if (isOk(response)) {
    diplomaticStatus.value = response.data;
  } else {
    console.error(formatError(response));
    diplomaticStatus.value = null;
  }
};

onMounted(() => {
  loadDiplomaticStatus();
});
</script>

<style scoped></style>
