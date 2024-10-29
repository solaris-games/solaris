<template>
<div>
  <p>
      The star <star-label :starId="event.data.starId" :starName="event.data.starName"/> has died and its infrastructure has been destroyed.
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
