<template>
  <div class="add-warning form-inline">
    <label for="warning-text">Warning text</label>
    <input class="form-control" type="text" id="warning-text" v-model="warningText" />
    <button class="btn btn-success btn-sm" type="button" @click="submitWarning" :disabled="!warningText">Add Warning</button>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { addWarning } from '@/services/typedapi/admin';
import { httpInjectionKey, isOk } from "@/services/typedapi";
import { toastInjectionKey } from "@/util/keys";

const props = defineProps<{
  userId: string
}>();

const emit = defineEmits<{
  onWarningAdded: [warning: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const warningText = ref('');

const submitWarning = async (e: Event) => {
  e.preventDefault();

  if (!warningText.value) {
    return;
  }

  const response = await addWarning(httpClient)(props.userId, warningText.value);

  if (isOk(response)) {
    emit('onWarningAdded', warningText.value);

    toast.success('Warning added successfully');
  } else {
    toast.error('An error occured while adding the warning');
  }

  warningText.value = '';
}
</script>

<style scoped>
  .add-warning {
    display: flex;
    width: 100%;
    gap: 8px;
    align-items: center;
    margin-left: 12px;
  }

  @media screen and (max-width: 576px) {
    .add-warning {
      flex-direction: column;
    }
  }

  .add-warning > .form-control {
      flex: 1;
  }
</style>
