<template>
    <button type="button" :class="classText" data-bs-toggle="modal" :data-bs-target="'#' + modalName">
        <slot></slot>
    </button>
</template>

<script>
export default {
  props: {
    modalName: String,
    classText: String
  }
}
</script>

<style scoped>

</style>
