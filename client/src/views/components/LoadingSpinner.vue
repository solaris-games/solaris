<template>
<div class="pt-2 pb-2 text-center" v-if="loading">
    <h6>
      <div class="spinner-border"></div>
    </h6>
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
