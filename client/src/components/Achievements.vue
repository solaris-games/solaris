<template>
<div class="row">
    <div class="col text-center bg-primary pt-2 pb-2">
        <h5>Victories</h5>
        <h2><i class="fas fa-trophy"></i> {{ victories }}</h2>
    </div>
    <div class="col text-center bg-secondary pt-2 pb-2">
        <h5>Rank</h5>
        <h2><i class="fas fa-star"></i> {{ rank }}</h2>
    </div>
    <div class="col text-center bg-primary pt-2 pb-2">
        <h5>Renown</h5>
        <h2><i class="fas fa-heart"></i> {{ renown }}</h2>
    </div>
</div>
</template>

<script>
import router from '../router';

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
