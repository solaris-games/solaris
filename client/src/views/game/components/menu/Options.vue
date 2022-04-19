<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="Options" @onCloseRequested="onCloseRequested"/>

    <options-form @onOptionsSaved="onCloseRequested" :isInGame="true"/>
  </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import OptionsFormVue from './OptionsForm'

export default {
  components: {
    'options-form': OptionsFormVue,
    'menu-title': MenuTitle
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
