<template>
  <dialog-modal
  v-if="Boolean(dialogSettings)"
  :cancelText="dialogSettings.confirmText"
  :confirmText="dialogSettings.cancelText"
  :hideCancelButton="dialogSettings.hideCancelButton"
  modalName="confirmModal"
  :titleText="dialogSettings.titleText"
  @onConfirm="dialogSettings.onConfirm"
  @onCancel="dialogSettings.onCancel">
    <p>{{dialogSettings.text}}</p>
  </dialog-modal>
</template>

<script>
import DialogModalVue from './DialogModal.vue'
export default {
  components: {
    'dialog-modal': DialogModalVue
  },
  props: {
    dialogSettings: Object
  }
}
</script>

<style>

</style>