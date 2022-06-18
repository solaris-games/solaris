<template>
  <span class="label label-default" v-tooltip:bottom="tooltip">
    <i class="fas fa-question-circle"></i>
  </span>
</template>

<script>
export default {
  props: {
    tooltip: String
  }
}
</script>

<style scoped>
</style>
