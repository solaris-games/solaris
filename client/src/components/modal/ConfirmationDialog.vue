<template>
  <dialog-modal
  v-if="Boolean(dialogSettings)"
  :cancelText="dialogSettings.confirmText"
  :confirmText="dialogSettings.cancelText"
  :hideCancelButton="dialogSettings.hideCancelButton"
  modalName="confirmModal"
  :titleText="dialogSettings.titleText"
  @onConfirm="onConfirm"
  @onCancel="onCancel">
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