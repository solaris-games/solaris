<template>
  <DialogModal
  :cancelText="props.dialogSettings?.cancelText || 'Cancel'"
  :confirmText="props.dialogSettings?.confirmText || 'Confirm'"
  :hideCancelButton="props.dialogSettings?.hideCancelButton || false"
  :cover="props.dialogSettings?.cover || false"
  modalName="confirmModal"
  :titleText="props.dialogSettings?.titleText || ''"
  @onConfirm="onConfirm"
  @onCancel="onCancel">
    <p style="white-space: pre-wrap">{{props.dialogSettings?.text || ''}}</p>
  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from './DialogModal.vue'

const props = defineProps<{
  dialogSettings: {
    titleText: string,
    text: string,
    confirmText: string,
    cancelText: string,
    hideCancelButton: boolean,
    cover: boolean,
    onConfirm: () => void,
    onCancel: () => void
  } | null
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

<style>

</style>
