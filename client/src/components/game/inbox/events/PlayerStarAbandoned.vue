<template>
<div v-if="star">
  <p>
      You have abandoned the star <a href="javascript:;" @click="onOpenStarDetailRequested">{{event.data.starName}}</a>.
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
  data () {
    return {
      star: null
    }
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
