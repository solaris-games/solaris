<template>
<div>
  <p>
      Your scientists have made a breakthrough in the field of <span class="text-success">{{event.data.technology.name}}</span>.
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
