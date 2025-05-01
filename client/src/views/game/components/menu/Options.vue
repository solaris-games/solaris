<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="Game Options" @onCloseRequested="onCloseRequested" @onTitleClicked="onTitleClicked"/>

    <options-form v-if="showErrorsCounter < 3" @onOptionsSaved="onCloseRequested" :isInGame="true"/>

    <error-log v-else />
  </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import OptionsFormVue from './OptionsForm.vue'
import ErrorLog from "./ErrorLog.vue";

export default {
  components: {
    ErrorLog,
    'options-form': OptionsFormVue,
    'menu-title': MenuTitle
  },
  data () {
    return {
      showErrorsCounter: 0,
    }
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onTitleClicked (e) {
      this.showErrorsCounter += 1;
    }
  }
}
</script>

<style scoped>
</style>
