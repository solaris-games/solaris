<template>
  <div>
    <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
      Show messages
    </button>
    <div class="collapse" id="collapseExample">
      <div class="well">
        ...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MessageReport",
  props: {
    report: Object
  }
}
</script>

<style scoped>

</style>
