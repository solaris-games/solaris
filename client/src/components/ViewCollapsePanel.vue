<template>
<div>
  <div class="row bg-primary mb-3">
    <div class="col">
      <h4 class="mt-3 mb-3">{{ title }}</h4>
    </div>
    <div class="col-auto" style="margin: auto">
      <button type="button" class="btn btn-sm btn-secondary" @click="toggle()">{{collapseText}}</button>
    </div>
  </div>
  <div v-if="!isCollapsed">
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
  methods:{
    toggle () {
        this.isCollapsed = !this.isCollapsed;
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
