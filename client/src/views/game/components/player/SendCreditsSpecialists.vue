<template>
  <div class="row bg-dark pt-2 pb-2">
    <div class="col-12">
      <form-error-list v-bind:errors="errors" />
    </div>

    <div class="col-12">
      <p class="mb-2">
        Send <strong>Specialist Tokens</strong>. (You have
        <span class="text-warning">{{ userPlayer.creditsSpecialists }}</span
        >)
      </p>

      <form class="row">
        <div class="col-7">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-user-astronaut"></i>
            </span>
            <input type="number" class="form-control" v-model="amount" />
          </div>
        </div>
        <div class="col-5">
          <div class="d-grid gap-2">
            <button
              type="button"
              :disabled="
                isHistoricalMode || isSendingCreditsSpecialists || amount <= 0
              "
              class="btn btn-success"
              @click="requestSendCredits"
            >
              <i class="fas fa-paper-plane"></i> Send
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import { ref, inject, computed } from "vue";
import FormErrorList from "../../../components/FormErrorList.vue";
import type { Game, Player } from "@/types/game";
import {
  extractErrors,
  formatError,
  httpInjectionKey,
  isOk,
} from "@/services/typedapi";
import { sendCreditsSpecialists } from "@/services/typedapi/trade";
import { useIsHistoricalMode } from "@/util/reactiveHooks";

import { useToast } from "vue-toast-notification";
import { useConfirm } from "@/hooks/confirm.ts";
const props = defineProps<{
  player: Player;
  userPlayer: Player;
}>();

const emit = defineEmits<{
  onCreditsSpecialistsSent: [amount: number];
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = useToast();
const confirm = useConfirm();

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const isHistoricalMode = useIsHistoricalMode(store);

const errors = ref<string[]>([]);
const isSendingCreditsSpecialists = ref(false);
const amount = ref(0);

const requestSendCredits = async () => {
  const confirmed = await confirm(
    "Send Specialist Tokens",
    `Are you sure you want to send ${amount.value} specialist token(s) to ${props.player.alias}?`,
  );

  if (confirmed) {
    await confirmSendCredits();
  }
};

const confirmSendCredits = async () => {
  errors.value = [];
  isSendingCreditsSpecialists.value = true;
  amount.value = Math.floor(amount.value);

  const response = await sendCreditsSpecialists(httpClient)(
    game.value._id,
    props.player._id,
    amount.value,
  );
  if (isOk(response)) {
    emit("onCreditsSpecialistsSent", amount.value);
    toast.default(
      `Sent ${amount.value} specialist tokens to ${props.player.alias}.`,
    );

    props.userPlayer.credits -= amount.value;
    amount.value = 0;
    props.player.reputation = response.data.reputation;
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isSendingCreditsSpecialists.value = false;
};
</script>

<style scoped>
input {
  text-align: center;
}
</style>
