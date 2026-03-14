<template>
    <div class="modal fade" :id="modalName" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true" :class="{'modal-cover': cover}">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLabel">{{titleText}}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer">
                    <button @click="onCancel" type="button" class="btn btn-outline-danger ps-3 pe-3" data-bs-dismiss="modal" v-if="!hideCancelButton">
                      <i class="fas fa-times"></i> {{cancelText || 'Cancel'}}
                    </button>
                    <button @click="onConfirm" type="button" class="btn btn-success ps-3 pe-3" data-bs-dismiss="modal">
                      <i class="fas fa-check"></i> {{ confirmText || 'Confirm' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    modalName?: string;
    titleText?: string;
    cancelText?: string;
    confirmText?: string;
    hideCancelButton?: boolean;
    cover?: boolean;
}>();

const emit = defineEmits<{
    onCancel: [];
    onConfirm: [];
}>();

const onCancel = () => {
    emit('onCancel');
};

const onConfirm = () => {
    emit('onConfirm');
};
</script>

<style scoped>

</style>
