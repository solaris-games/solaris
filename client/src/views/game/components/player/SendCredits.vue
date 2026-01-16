<template>
<div class="row bg-dark pt-2 pb-2">
  <div class="col-12">
    <form-error-list v-bind:errors="errors"/>
  </div>

  <div class="col-12">
    <p class="mb-2">Send <strong>Credits</strong>. (You have <span class="text-warning">${{userPlayer.credits}}</span>)</p>

    <form class="row">
      <div class="col-7">
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input type="number" class="form-control" v-model="amount"/>
        </div>
      </div>
      <div class="col-5">
        <div class="d-grid gap-2">
          <modalButton modalName="sendCreditsModal" classText="btn btn-success" :disabled="isHistoricalMode || isSendingCredits || amount <= 0"><i class="fas fa-paper-plane"></i> Send</modalButton>
        </div>
      </div>
    </form>
  </div>

  <dialogModal modalName="sendCreditsModal" titleText="Send Credits" cancelText="No" confirmText="Yes" @onConfirm="confirmSendCredits">
    <p>Are you sure you want to send <b>${{amount}}</b> to <b>{{player.alias}}</b>?</p>
  </dialogModal>
</div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import ModalButton from '../../../components/modal/ModalButton.vue'
import DialogModal from '../../../components/modal/DialogModal.vue'
import FormErrorList from '../../../components/FormErrorList.vue'
import type {Game, Player} from "@/types/game";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {sendCredits} from "@/services/typedapi/trade";
import { useStore } from 'vuex';
import {toastInjectionKey} from "@/util/keys";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const props = defineProps<{
  player: Player,
  userPlayer: Player,
}>();

const emit = defineEmits<{
  onCreditsSent: [amount: number],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);
const isHistoricalMode = useIsHistoricalMode(store);

const errors = ref<string[]>([]);
const isSendingCredits = ref(false);
const amount = ref(0);

const confirmSendCredits = async () => {
  errors.value = [];
  isSendingCredits.value = true;
  amount.value = Math.floor(amount.value);

  const response = await sendCredits(httpClient)(game.value._id, props.player._id, amount.value);
  if (isOk(response)) {
    emit("onCreditsSent", amount.value);
    toast.default(`Sent ${amount.value} credits to ${props.player.alias}.`);

    props.userPlayer.credits -= amount.value;
    amount.value = 0;
    props.player.reputation = response.data.reputation;
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isSendingCredits.value = false;
}
</script>

<style scoped>
input {
  text-align: center;
}
</style>
