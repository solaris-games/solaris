<template>
  <div class="menu-page container">
    <menu-title :title="menuTitle" @onCloseRequested="onCloseRequested"/>

    <p class="mb-1">
      Choose a reason why you are reporting <a href="javascript:;"
                                               @click="onOpenPlayerDetailRequested">{{ player.alias }}</a>.
    </p>

    <p class="mb-2">
      <small>
        If the reason is not listed, please contact a developer or community manager on
        <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord">
          <i class="fab fa-discord"></i>
          <span class="ms-1">Discord</span>
        </a>
      </small>
    </p>

    <form @submit.prevent>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionAbuse" id="chkAbuse">
        <label class="form-check-label" for="chkAbuse">
          Verbal Abuse
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionSpamming" id="chkSpamming">
        <label class="form-check-label" for="chkSpamming">
          Spamming
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionMultiboxing" id="chkMultiboxing">
        <label class="form-check-label" for="chkMultiboxing">
          Multiboxing
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionInappropriateAlias" id="chkInappropriateAlias">
        <label class="form-check-label" for="chkInappropriateAlias">
          Inappropriate Alias
        </label>
      </div>

      <p class="text-danger mb-1 mt-2">
        <small>WARNING: Abuse of the report feature may lead to your account being banned.</small>
      </p>

      <div class="text-end pt-2 pb-2">
        <button class="btn btn-danger me-1" type="button" @click="onOpenPlayerDetailRequested">
          <i class="fas fa-arrow-left"></i>
          Cancel
        </button>
        <button class="btn btn-warning" type="button" @click="confirmReportPlayer"
                :disabled="!optionAbuse && !optionSpamming && !optionMultiboxing && !optionInappropriateAlias">
          <i class="fas fa-flag"></i>
          Report
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue';
import GameHelper from '../../../../services/gameHelper';
import ReportApiService from '../../../../services/api/report';
import { ref, computed, inject } from 'vue';
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import {toastInjectionKey} from "@/util/keys";
import {makeConfirm} from "@/util/confirm";

export type Args = {
  playerId: string,
  messageId?: string,
  conversationId?: string,
};

const props = defineProps<{
  args: Args,
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const confirm = makeConfirm(store);

const optionAbuse = ref(false);
const optionSpamming = ref(false);
const optionMultiboxing = ref(false);
const optionInappropriateAlias = ref(false);

const player = computed(() => {
  return GameHelper.getPlayerById(store.state.game, props.args.playerId)!;
});

const menuTitle = computed(() => {
  if (props.args.messageId) {
    return 'Report Message';
  } else {
    return 'Report Player';
  }
});

const onCloseRequested = (e: Event) => {
  emit('onCloseRequested');
};

const onOpenPlayerDetailRequested = () => {
  emit('onOpenPlayerDetailRequested', props.args.playerId);
};

const confirmReportPlayer = async () => {
  if (!await confirm(menuTitle.value, `Are you sure you want to report ${player.value?.alias}?`)) {
    return;
  }

  try {
    await ReportApiService.reportPlayer(store.state.game!._id, props.args.playerId, props.args.messageId, props.args.conversationId, optionAbuse.value, optionSpamming.value, optionMultiboxing.value, optionInappropriateAlias.value);

    toast.success(`You have reported ${player.value?.alias}. We will investigate and take action if necessary.`);

    onOpenPlayerDetailRequested();
  } catch (err) {
    console.error(err);
  }
};
</script>

<style scoped>
</style>
