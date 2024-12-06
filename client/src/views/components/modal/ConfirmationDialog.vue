<template>
  <DialogModal
  v-if="Boolean(props.dialogSettings)"
  :cancelText="props.dialogSettings.cancelText"
  :confirmText="props.dialogSettings.confirmText"
  :hideCancelButton="props.dialogSettings.hideCancelButton"
  :cover="props.dialogSettings.cover"
  modalName="confirmModal"
  :titleText="props.dialogSettings.titleText"
  @onConfirm="onConfirm"
  @onCancel="onCancel">
    <p style="white-space: pre-wrap">{{props.dialogSettings.text}}</p>
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
  }
}>();

const onConfirm = (e) => props.dialogSettings.onConfirm();

const onCancel = (e) => props.dialogSettings.onCancel();
</script>

<style>

</style>
