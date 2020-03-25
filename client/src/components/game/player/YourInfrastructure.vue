<template>
  <div class="row">
    <div class="col bg-secondary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">{{economy}}</span>
    </div>
    <div class="col bg-primary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">{{industry}}</span>
    </div>
    <div class="col bg-secondary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">{{science}}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    economy: Number,
    industry: Number,
    science: Number
  }
}
</script>

<style scoped>
</style>
