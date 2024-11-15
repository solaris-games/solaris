<template>
  <DialogModal
  v-if="Boolean(dialogSettings)"
  :cancelText="dialogSettings.cancelText"
  :confirmText="dialogSettings.confirmText"
  :hideCancelButton="dialogSettings.hideCancelButton"
  :cover="dialogSettings.cover"
  modalName="confirmModal"
  :titleText="dialogSettings.titleText"
  @onConfirm="onConfirm"
  @onCancel="onCancel">
    <p style="white-space: pre-wrap">{{dialogSettings.text}}</p>
  </DialogModal>
</template>

<script setup type="ts">
import DialogModal from './DialogModal.vue'

const props = defineProps({
  dialogSettings: Object
});

const onConfirm = (e) => props.dialogSettings.onConfirm();

const onCancel = (e) => props.dialogSettings.onCancel();
</script>

<style>

</style>