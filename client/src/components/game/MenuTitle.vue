<template>
<div class="row pt-2">
    <div class="col">
        <h3>{{ title }}</h3>
    </div>
    <div class="col-auto">
        <button @click="close" class="btn btn-info float-right"><i class="fas fa-times"></i></button>
    </div>
</div>
</template>

<script>
export default {
  props: {
    title: String
  },
  methods: {
    close () {
        this.$emit('onCloseRequested')
    }
  }
}
</script>

<style scoped>
h2 {
    margin-bottom: 0;
}
</style>
