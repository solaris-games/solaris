<template>
<div class="row pt-2">
    <div class="col">
        <h4 @click="titleClicked">{{ title }}</h4>
    </div>
    <div class="col-auto">
        <slot></slot>
        <button @click="close" class="btn btn-danger btn-sm ms-1"><i class="fas fa-times"></i></button>
    </div>
</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onTitleClicked: []
}>();

const close = () => {
  emit('onCloseRequested');
};

const titleClicked = () => {
  emit('onTitleClicked');
};

</script>

<style scoped>
h3 {
  font-size: 1.8rem;
}
</style>
