<template>
<div>
  <p>
      You hired the specialist <span class="text-warning">{{event.data.specialistName}}</span> at the star <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
  </p>
  <p>
    <small><em>{{event.data.specialistDescription}}</em></small>
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
