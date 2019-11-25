<template>
<div class="row">
    <div class="col text-center bg-primary pt-2 pb-2">
        <h6>Victories</h6>
        <h2><i class="fas fa-trophy"></i> {{ victories }}</h2>
    </div>
    <div class="col text-center bg-secondary pt-2 pb-2">
        <h6>Rank</h6>
        <h2><i class="fas fa-star"></i> {{ rank }}</h2>
    </div>
    <div class="col text-center bg-primary pt-2 pb-2">
        <h6>Renown</h6>
        <h2><i class="fas fa-heart"></i> {{ renown }}</h2>
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
