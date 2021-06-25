<template>
<div v-if="star">
  <p>
      The warp gate at <a href="javascript:;" @click="onOpenStarDetailRequested">{{event.data.starName}}</a> has been destroyed.
  </p>
</div>
</template>

<script>
export default {
  components: {

  },
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
