<template>
  <DialogModal
    :cancelText="props.dialogSettings?.cancelText || 'Cancel'"
    :confirmText="props.dialogSettings?.confirmText || 'Confirm'"
    :hideCancelButton="props.dialogSettings?.hideCancelButton || false"
    :cover="props.dialogSettings?.cover || false"
    modalName="confirmModal"
    :titleText="props.dialogSettings?.titleText || ''"
    @onConfirm="onConfirm"
    @onCancel="onCancel"
  >
    <p style="white-space: pre-wrap">
      {{ props.dialogSettings?.text || "" }}
    </p>
    <p v-for="p in props.dialogSettings?.additionalParagraphs">{{ p }}</p>
  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from "./DialogModal.vue";
import type { ConfirmationDialogSettings } from "@/stores/confirmationDialog.ts";

const props = defineProps<{
  dialogSettings: ConfirmationDialogSettings | null;
}>();

const onConfirm = () => {
  if (props.dialogSettings?.onConfirm) {
    props.dialogSettings.onConfirm();
  }
};

const onCancel = () => {
  if (props.dialogSettings?.onCancel) {
    props.dialogSettings.onCancel();
  }
};
</script>

<style></style>
