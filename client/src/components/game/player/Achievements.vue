<template>
  <div class="row">
    <div class="col text-center bg-primary pt-2 pb-2">
        <h6>Victories</h6>
        <h2 class="d-none d-md-block"><i class="fas fa-trophy text-warning"></i> {{ victories }}</h2>
        <h3 class="d-md-none"><i class="fas fa-trophy text-warning"></i> {{ victories }}</h3>
    </div>
    <div class="col text-center bg-secondary pt-2 pb-2">
        <h6>Rank</h6>
        <h2 class="d-none d-md-block"><i class="fas fa-star text-info"></i> {{ rank }}</h2>
        <h3 class="d-md-none"><i class="fas fa-star text-info"></i> {{ rank }}</h3>
    </div>
    <div class="col text-center bg-primary pt-2 pb-2">
        <h6>Renown</h6>
        <h2 class="d-none d-md-block"><i class="fas fa-heart text-danger"></i> {{ renown }}</h2>
        <h3 class="d-md-none"><i class="fas fa-heart text-danger"></i> {{ renown }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    victories: Number,
    rank: Number,
    renown: Number
  }
}
</script>

<style scoped>
</style>
