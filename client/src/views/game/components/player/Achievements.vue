<template>
  <div class="row">
    <div class="col text-center pt-2 pb-1 ps-1 pe-1 card">
        <h6>Rank</h6>
        <h3 v-if="!isSmallHeaders">
          <img class="user-level-icon" :src="levelSrc" alt="rank">
          <!-- <i class="fas fa-star text-info me-2"></i> -->
          {{ rank }}
        </h3>
        <h4 v-if="isSmallHeaders">
          <img class="user-level-icon" :src="levelSrc" alt="rank">
          <!-- <i class="fas fa-star text-info me-2"></i> -->
          {{ rank }}
        </h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
    <div class="col text-center pt-2 pb-1 ps-1 pe-1 card">
        <h6>Victories</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-trophy text-warning me-2"></i>{{ victories }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-trophy text-warning me-2"></i>{{ victories }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
    <div class="col text-center pt-2 pb-1 ps-1 pe-1 card">
        <h6>Renown</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-heart text-danger me-2"></i>{{ renown }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-heart text-danger me-2"></i>{{ renown }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    level: Number,
    victories: Number,
    rank: Number,
    renown: Number
  },
  methods: {
  },
  computed: {
    levelSrc () {
      return new URL(`../../../../assets/levels/${this.level}.png`, import.meta.url).href
    },
    isSmallHeaders () {
      return this.victories >= 100 || this.rank >= 100 || this.renown >= 100
    }
  }
}
</script>

<style scoped>
.row {
  --bs-gutter-x: 0px;
}

.user-level-icon {
  height: 28px;
}
</style>
