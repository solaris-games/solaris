<template>
<div>
  <p>
      You have abandoned the star <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
  </p>
</div>
</template>

<script>
import StarLabelVue from '../../star/StarLabel.vue'

export default {
  components: {
    'star-label': StarLabelVue
  },
  props: {
    event: Object
  }
}
</script>

<style scoped>
</style>
