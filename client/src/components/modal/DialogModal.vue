<template>
    <div class="modal fade" :id="modalName" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLabel">{{titleText}}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer">
                    <button @click="onCancel" type="button" class="btn btn-danger pl-3 pr-3" data-dismiss="modal" v-if="!hideCancelButton">{{cancelText || 'Cancel'}}</button>
                    <button @click="onConfirm" type="button" class="btn btn-success pl-3 pr-3" data-dismiss="modal">{{ confirmText || 'Confirm' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    modalName: String,
    titleText: String,
    cancelText: String,
    confirmText: String,
    hideCancelButton: Boolean
  },
  methods: {
    onCancel () {
      this.$emit('onCancel')
    },
    onConfirm () {
      this.$emit('onConfirm')
    }
  }
}
</script>

<style scoped>

</style>
