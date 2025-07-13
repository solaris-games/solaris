<template>
  <div class="position-static btn-group">
    <button class="btn btn-sm ms-1"
      :class="'btn-danger'" @click="trash()" >
      <i class="fas fa-trash"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import type {PlayerScheduledActions} from "@solaris-common";
import {trashBulk} from "@/services/typedapi/star";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { inject } from 'vue';
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';
import {toastInjectionKey} from "@/util/keys";

const props = defineProps<{
  action: PlayerScheduledActions<string>,
}>();

const emit = defineEmits<{
  bulkScheduleTrashed: [actionId: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const trash = async () => {
  const response = await trashBulk(httpClient)(store.state.game._id, props.action._id);

  if (isOk(response)) {
    store.commit('gameBulkActionTrashed', props.action);

    toast.default('Your scheduled bulk upgrade has been deleted.');

    emit('bulkScheduleTrashed', props.action._id);
  } else {
    console.error(formatError(response));

    toast.error("Failed to delete scheduled bulk upgrade due to an error.");
  }
};
</script>

<style scoped>
</style>
