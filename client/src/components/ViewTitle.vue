<template>
<div class="row bg-primary pt-3 pb-3 mb-2">
    <div class="col">
        <h2>{{ title }}</h2>
    </div>
    <div class="col-1" v-if="!hideHomeButton">
        <button v-if="navigation" @click="navigate" id="btnHome" class="btn btn-info float-right"><i v-bind:class="'fas fa-' + icon"></i></button>
    </div>
</div>
</template>

<script>
import router from '../router'

export default {
  props: {
    title: String,
    navigation: { type: String, default: 'main-menu' },
    icon: { type: String, default: 'home' },
    hideHomeButton: Boolean
  },
  methods: {
    navigate () {
      router.push({ name: this.navigation })
    }
  }
}
</script>

<style scoped>
h2 {
    margin-bottom: 0;
}
</style>
