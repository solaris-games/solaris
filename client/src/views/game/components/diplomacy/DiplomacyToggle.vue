<script setup lang="ts">
import { inject, computed } from "vue";
import type { DiplomaticStatus } from "@solaris/common";
import { httpInjectionKey } from "@/services/http.ts";
import { useGameStore } from "@/stores/game.ts";
import type { Game } from "@/types/game.ts";
import { useConfirm } from "@/hooks/confirm.ts";
import gameHelper from "@/services/gameHelper.ts";
import { useToast } from "vue-toast-notification";
import DiplomacyHelper from "@/services/diplomacyHelper.ts";
import { ally, enemy, neutral } from "@solaris/api-client/diplomacy.ts";
import { extractErrors, formatError, isOk } from "@solaris/api-client";

const props = defineProps<{
  diplomaticStatus: DiplomaticStatus<string>;
}>();

const emit = defineEmits<{
  onApiRequestSuccess: [];
  onApiRequestError: [errors: string[]];
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = useToast();

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const confirm = useConfirm();

const userPlayer = computed(() => gameHelper.getUserPlayer(game.value)!);

const getPlayer = (playerId: string) =>
  gameHelper.getPlayerById(game.value, playerId)!;

const getPlayerAlias = (playerId: string) => getPlayer(playerId).alias;

const declareAlly = async (diplomaticStatus: DiplomaticStatus<string>) => {
  const playerAlias = getPlayerAlias(diplomaticStatus.playerIdTo);

  let allianceFee = 0;
  const cycleCredits =
    gameHelper.calculateIncome(game.value, userPlayer.value) || 0;

  if (DiplomacyHelper.isAllianceUpkeepEnabled(game.value)) {
    allianceFee = DiplomacyHelper.getAllianceUpkeepCost(
      game.value,
      userPlayer.value,
      cycleCredits,
      1,
    );

    if (
      !(await confirm(
        "Alliance Fee",
        `Allying with this player will cost you $${allianceFee} credits, are you sure you want to continue?`,
      ))
    ) {
      return;
    }
  }

  if (game.value.settings.diplomacy.lockedAlliances === "enabled") {
    if (
      !(await confirm(
        "Permanent Alliance",
        "If you form an alliance in this game, you will not be able to cancel it.",
      ))
    ) {
      return;
    }
  }

  if (
    !(await confirm(
      "Declare Allies",
      `Are you sure you want to change your diplomatic status to ${playerAlias} to allied?`,
    ))
  ) {
    return;
  }

  const response = await ally(httpClient)(
    game.value._id,
    diplomaticStatus.playerIdTo,
  );
  if (isOk(response)) {
    if (response.data.statusTo === "allies") {
      toast.success(`Your diplomatic status to ${playerAlias} is now allied.`);
    } else {
      toast.error(
        `You can not ally ${playerAlias}. Check the maximum alliance limits.`,
      );
    }

    diplomaticStatus.statusFrom = response.data.statusFrom;
    diplomaticStatus.statusTo = response.data.statusTo;
    diplomaticStatus.actualStatus = response.data.actualStatus;

    userPlayer.value.credits -= allianceFee;

    emit("onApiRequestSuccess");
  } else {
    console.error(formatError(response));
    emit("onApiRequestError", extractErrors(response));
  }
};

const declareEnemy = async (diplomaticStatus: DiplomaticStatus<string>) => {
  const playerAlias = getPlayerAlias(diplomaticStatus.playerIdTo);

  if (
    !(await confirm(
      "Declare Enemy",
      `Are you sure you want to change your diplomatic status to ${playerAlias} to enemies?`,
    ))
  ) {
    return;
  }

  const response = await enemy(httpClient)(
    game.value._id,
    diplomaticStatus.playerIdTo,
  );

  if (isOk(response)) {
    toast.success(`Your diplomatic status to ${playerAlias} is now enemies.`);

    diplomaticStatus.statusFrom = response.data.statusFrom;
    diplomaticStatus.statusTo = response.data.statusTo;
    diplomaticStatus.actualStatus = response.data.actualStatus;

    emit("onApiRequestSuccess");
  } else {
    console.error(formatError(response));
    emit("onApiRequestError", extractErrors(response));
  }
};

const declareNeutral = async (diplomaticStatus: DiplomaticStatus<string>) => {
  const playerAlias = getPlayerAlias(diplomaticStatus.playerIdTo);

  if (
    !(await confirm(
      "Declare Neutral",
      `Are you sure you want to change your diplomatic status to ${playerAlias} to neutral?`,
    ))
  ) {
    return;
  }

  const response = await neutral(httpClient)(
    game.value._id,
    diplomaticStatus.playerIdTo,
  );
  if (isOk(response)) {
    toast.success(`Your diplomatic status to ${playerAlias} is now neutral.`);

    diplomaticStatus.statusFrom = response.data.statusFrom;
    diplomaticStatus.statusTo = response.data.statusTo;
    diplomaticStatus.actualStatus = response.data.actualStatus;

    emit("onApiRequestSuccess");
  } else {
    console.error(formatError(response));
    emit("onApiRequestError", extractErrors(response));
  }
};
</script>

<template>
  <div class="btn-group">
    <button
      class="btn btn-sm"
      :class="{
        'btn-success': diplomaticStatus.statusTo === 'allies',
        'btn-outline-success': diplomaticStatus.statusTo !== 'allies',
      }"
      @click="declareAlly(diplomaticStatus)"
      title="Declare this player an ally"
    >
      <i class="fas fa-handshake"></i>
    </button>
    <button
      class="btn btn-sm"
      :class="{
        'btn-info': diplomaticStatus.statusTo === 'neutral',
        'btn-outline-info': diplomaticStatus.statusTo !== 'neutral',
      }"
      @click="declareNeutral(diplomaticStatus)"
      title="Declare this player as neutral"
    >
      <i class="fas fa-dove"></i>
    </button>
    <button
      class="btn btn-sm"
      :class="{
        'btn-danger': diplomaticStatus.statusTo === 'enemies',
        'btn-outline-danger': diplomaticStatus.statusTo !== 'enemies',
      }"
      @click="declareEnemy(diplomaticStatus)"
      title="Declare this player as an enemy"
    >
      <i class="fas fa-crosshairs"></i>
    </button>
  </div>
</template>

<style scoped></style>
