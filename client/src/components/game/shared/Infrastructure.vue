<template>
  <div class="row">
    <div class="col text-center bg-primary pt-2 pb-1">
        <h6>Economy</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-money-bill-wave text-success mr-2"></i>{{ economy }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-money-bill-wave text-success mr-2"></i>{{ economy }}</h4>
    </div>
    <div class="col text-center bg-secondary pt-2 pb-1">
        <h6>Industry</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-tools text-warning mr-2"></i>{{ industry }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-tools text-warning mr-2"></i>{{ industry }}</h4>
    </div>
    <div class="col text-center bg-primary pt-2 pb-1">
        <h6>Science</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-flask text-info mr-2"></i>{{ science }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-flask text-info mr-2"></i>{{ science }}</h4>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    economy: Number,
    industry: Number,
    science: Number
  },
  computed: {
    isSmallHeaders () {
      return this.economy >= 100 || this.industry >= 100 || this.science >= 100
    }
  }
}
</script>

<style scoped>
</style>
