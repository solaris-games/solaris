<template>
<div class="row pt-2">
    <div class="col">
        <h4 @click="titleClicked">{{ title }}</h4>
    </div>
    <div class="col-auto">
        <slot></slot>
        <button @click="close" class="btn btn-danger btn-sm ms-1"><i class="fas fa-times"></i></button>
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
    },
    titleClicked () {
      this.$emit('onTitleClicked')
    }
  }
}
</script>

<style scoped>
h3 {
  font-size: 1.8rem;
}
</style>
