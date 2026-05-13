<template>
  <div class="position-static btn-group">
    <button class="btn btn-sm ms-1"
      :class="{'btn-success':action.active,'btn-danger':!action.active}" @click="toggleRepeat()" >
      <i class="fas" style="width: 13px;" :class="{'fa-sync':action.active && action.repeat,'fa-arrow-right':action.active && !action.repeat,'fa-pause':!action.active}"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import type {PlayerScheduledActions} from "@solaris-common";
import {toggleScheduledBulk} from "@/services/typedapi/star";
import { inject } from 'vue';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';

const props = defineProps<{
  action: PlayerScheduledActions<string>,
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const toggleRepeat = async () => {
  const response = await toggleScheduledBulk(httpClient)(store.state.game._id, props.action._id);

  if (isOk(response)) {

    // Cycle through modes:
    // 1. repeat && active = Repeat every cycle
    // 2. repeat && !active = Paused, but repeat every cycle
    // 3. !repeat && active = One time only
    if (props.action.repeat) {
      if (props.action.active) {
        props.action.active = !props.action.active;
      } else {
        props.action.active = !props.action.active;
        props.action.repeat = !props.action.repeat;
      }
    } else {
      props.action.repeat = !props.action.repeat;
    }

    if (props.action.repeat) {
      if (props.action.active) {
        toast.default(`Your Bulk Upgrade will be repeated every cycle.`)
      } else {
        toast.default(`Your Bulk Upgrade is paused and will not be executed.`)
      }
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
