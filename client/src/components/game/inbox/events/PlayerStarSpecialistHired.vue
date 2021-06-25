<template>
<div v-if="star">
  <p>
      You hired the specialist <span class="text-warning">{{event.data.specialistName}}</span> at the star <a href="javascript:;" @click="onOpenStarDetailRequested">{{event.data.starName}}</a>.
  </p>
  <p>
    <small><em>{{event.data.specialistDescription}}</em></small>
  </p>
</div>
</template>

<script>
export default {
  props: {
    event: Object
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.event.data.starId)
    }
  }
}
</script>

<style scoped>
</style>
