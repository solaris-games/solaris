<template>
  <div class="position-static btn-group">
    <button class="btn btn-sm ms-1"
      :class="{'btn-success':action.repeat,'btn-danger':!action.repeat}" @click="toggleRepeat()" >
      <i class="fas fa-sync"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import type {PlayerScheduledActions} from "@solaris-common";
import {toggleScheduledBulk} from "@/services/typedapi/star";
import { inject } from 'vue';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";


const props = defineProps<{
  action: PlayerScheduledActions<string>,
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useGameStore();

const toggleRepeat = async () => {
  const response = await toggleScheduledBulk(httpClient)(store.game._id, props.action._id);

  if (isOk(response)) {
    props.action.repeat = !props.action.repeat;

    if (props.action.repeat) {
      toast.default(`Your Bulk Upgrade will be repeated every cycle.`)
    } else {
      toast.default(`Your Bulk Upgrade will only be executed on tick ${props.action.tick}.`)
    }
  } else {
    console.error(formatError(response));
    toast.error("Failed to repeat bulk upgrade");
  }
}
</script>

<style scoped>
</style>
