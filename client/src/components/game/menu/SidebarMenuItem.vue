<template>
  <a @click="setMenuState()"
    :title="tooltip"
    :class="{'active':isActive}">
      <i :class="iconClass"></i>
  </a>
</template>

<script>
export default {
  props: {
    menuState: String,
    tooltip: String,
    iconClass: String
  },
  methods: {
    setMenuState () {
      this.$store.commit('setMenuState', {
        state: this.menuState,
        args: null
      })
    }
  },
  computed: {
    isActive () {
      return this.menuState === this.$store.state.menuState
    }
  }
}
</script>

<style scoped>
a {
  display: block;
  text-align: center;
  font-size: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  color: white !important;
}

a:hover {
  color: #375a7f !important;
}

a.active {
  background-color: #375a7f;
}

a.active:hover {
  color: white !important;
}
</style>
