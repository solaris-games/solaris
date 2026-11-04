<template>
  <div class="d-inline" v-if="isGameInProgress && !userPlayer.defeated">
    <button
      class="btn btn-danger btn-sm"
      :disabled="isConceding"
      @click="onConcedeDefeatRequested"
      title="Concede Defeat"
    >
      <i class="fas fa-skull-crossbones"></i>
      {{ isTutorialGame ? "Quit Tutorial" : "Concede Defeat" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import GameHelper from "../../../../services/gameHelper";
import { computed } from "vue";
import { useConfirm } from "@/hooks/confirm.ts";
import { useConcedeGame } from "@/hooks/useConcedeGame.ts";

const emit = defineEmits<{
  onViewConcedeDefeatRequested: [];
}>();

const store = useGameStore();
const confirm = useConfirm();

const { isConceding, concede } = useConcedeGame();

const userPlayer = computed(() => GameHelper.getUserPlayer(store.game!)!);
const isTutorialGame = computed(() => GameHelper.isTutorialGame(store.game!));
const isGameInProgress = computed(
  () =>
    GameHelper.isGameStarted(store.game!) &&
    !GameHelper.isGameFinished(store.game!),
);

const onConcedeDefeatRequested = async () => {
  if (isTutorialGame.value) {
    if (
      !(await confirm(
        "Quit Tutorial",
        "Are you sure you want to exit the tutorial? All progress will be lost.",
      ))
    ) {
      return;
    }

    await concede(false, true);
    return;
  }

  emit("onViewConcedeDefeatRequested");
};
</script>

<style scoped></style>
