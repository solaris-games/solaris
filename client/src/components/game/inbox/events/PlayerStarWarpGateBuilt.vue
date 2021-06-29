<template>
<div>
  <p>
      A warp gate has been built at <a href="javascript:;" @click="onOpenStarDetailRequested">{{event.data.starName}}</a>.
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
