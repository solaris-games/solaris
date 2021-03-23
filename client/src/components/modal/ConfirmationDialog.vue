<template>
  <dialog-modal
  :cancelText="dialogSettings.confirmText"
  :confirmText="dialogSettings.cancelText"
  :hideCancelButton="dialogSettings.hideCancelButton"
  :modalName="confirmModal"
  :titleText="dialogSettings.titleText"
  ref="modalElement">
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
  mounted () {
    this.$store.commit('setConfirmationModalElement', this.$refs.modalElement)
  }
}
</script>

<style>

</style>