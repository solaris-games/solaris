<template>
  <div class="row">
    <div class="col text-center bg-primary pt-2 pb-2">
        <h6>Economy</h6>
        <h2><i class="fas fa-money-bill-wave"></i> {{ economy }}</h2>
    </div>
    <div class="col text-center bg-secondary pt-2 pb-2">
        <h6>Industry</h6>
        <h2><i class="fas fa-tools"></i> {{ industry }}</h2>
    </div>
    <div class="col text-center bg-primary pt-2 pb-2">
        <h6>Science</h6>
        <h2><i class="fas fa-flask"></i> {{ science }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    economy: Number,
    industry: Number,
    science: Number,
  }
}
</script>

<style scoped>
</style>
