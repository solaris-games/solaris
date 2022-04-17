<template>
<div>
  <p>
      Your stars have been upgraded.
      You purchased <span class="text-warning">{{event.data.upgradeReport.upgraded}} {{event.data.upgradeReport.infrastructureType}}</span> for
      <span class="text-success">${{event.data.upgradeReport.cost}}</span> credits.
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
