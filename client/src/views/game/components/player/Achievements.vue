<template>
  <div class="row">
    <div class="col text-center bg-primary pt-2 pb-1 pl-1 pr-1">
        <h6>Victories</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-trophy text-warning mr-2"></i>{{ victories }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-trophy text-warning mr-2"></i>{{ victories }}</h4>
    </div>
    <div class="col text-center bg-secondary pt-2 pb-1 pl-1 pr-1">
        <h6>Rank</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-star text-info mr-2"></i>{{ rank }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-star text-info mr-2"></i>{{ rank }}</h4>
    </div>
    <div class="col text-center bg-primary pt-2 pb-1 pl-1 pr-1">
        <h6>Renown</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-heart text-danger mr-2"></i>{{ renown }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-heart text-danger mr-2"></i>{{ renown }}</h4>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    victories: Number,
    rank: Number,
    renown: Number
  },
  computed: {
    isSmallHeaders () {
      return this.victories >= 100 || this.rank >= 100 || this.renown >= 100
    }
  }
}
</script>

<style scoped>
</style>
