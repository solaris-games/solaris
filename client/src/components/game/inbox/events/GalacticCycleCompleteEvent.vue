<template>
<div>
  <p>
    A galactic cycle is complete. You have received <span class="text-success">${{event.data.creditsEconomy}}</span> from your
    economic infrastructure and <span class="text-success">${{event.data.creditsBanking}}</span> from your banking technology.
  </p>
  <p>
    Your experimental scientists have stumbled across a new discovery which has unlocked 
    <span class="text-success">{{event.data.experimentAmount}} points</span> of research in the field of <span class="text-success">{{event.data.experimentTechnology}}</span>.
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

  }
}
</script>

<style scoped>
</style>
