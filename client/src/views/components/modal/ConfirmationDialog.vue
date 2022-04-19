<template>
  <dialog-modal
  v-if="Boolean(dialogSettings)"
  :cancelText="dialogSettings.cancelText"
  :confirmText="dialogSettings.confirmText"
  :hideCancelButton="dialogSettings.hideCancelButton"
  modalName="confirmModal"
  :titleText="dialogSettings.titleText"
  @onConfirm="onConfirm"
  @onCancel="onCancel">
    <p style="white-space: pre-wrap">{{dialogSettings.text}}</p>
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
  },
  methods: {
    onConfirm (e) {
      this.dialogSettings.onConfirm()
    },
    onCancel (e) {
      this.dialogSettings.onCancel()
    }
  }
}
</script>

<style>

</style>