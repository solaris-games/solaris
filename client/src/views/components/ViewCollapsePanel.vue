<template>
<div>
  <div class="row bg-dark mb-2">
    <div class="col">
      <h4 class="mt-3 mb-3">{{ title }}</h4>
    </div>
    <div class="col-auto" style="margin: auto">
      <button type="button" class="btn btn-sm btn-outline-primary" @click="toggle()">{{collapseText}}</button>
    </div>
  </div>
  <div v-if="!isCollapsed" class="mb-3">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  props: {
    title: String,
    startsOpened: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      isCollapsed: true
    }
  },
  mounted () {
    this.isCollapsed = !this.startsOpened || false
  },
  methods: {
    toggle () {
      this.isCollapsed = !this.isCollapsed;
      this.$emit('onToggle', this.isCollapsed);
    }
  },
  computed: {
    collapseText () {
      return this.isCollapsed ? 'expand' : 'collapse'
    }
  }
}
</script>

<style scoped>
</style>
