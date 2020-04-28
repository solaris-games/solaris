<template>
<div class="pt-2 pb-2 text-center" v-if="loading">
    <h1><i class="fas fa-atom fa-spin"></i></h1>
    <p class="mb-1" v-if="!hideText">{{text || 'Loading...'}}</p>
</div>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    text: String,
    hideText: Boolean
  }
}
</script>

<style scoped>
</style>
