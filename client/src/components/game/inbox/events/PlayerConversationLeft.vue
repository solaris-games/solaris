<template>
<div>
  <p>
      You left the conversation <span class="text-success">{{event.data.name}}</span>.
  </p>
</div>
</template>

<script>
export default {
  components: {

  },
  props: {
    event: Object
  }
}
</script>

<style scoped>
</style>
