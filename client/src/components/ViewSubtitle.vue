<template>
<div class="row bg-primary mb-3">
  <div class="col">
    <h4 class="mt-3 mb-3">{{ title }}</h4>
  </div>
  <div class="col-auto" style="margin: auto" v-if="collapseName">
    <button class="btn btn-sm btn-default" @click="changeText()"> {{inputValue}} </button>
  </div>
</div>
</template>

<script>
export default {
  props: {
    title: String,
    collapseName: String,
    startsOpened: {
        default: false,
        type: Boolean
    }
  },
  data() {
    return {
      isCollapsed: !this.startsOpened,
      inputValue: ""
    }
  },
  async mounted () {
     this.setButtonName();
  },
  methods:{
    changeText(){
        this.isCollapsed = !this.isCollapsed;
        this.$emit('collapse', this.collapseName);
        this.setButtonName();
    },
    setButtonName(){
        this.inputValue = this.isCollapsed ? "expand": "collapse"
    }
  }
}
</script>

<style scoped>
</style>
