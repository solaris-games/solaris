<template>
  <div class="row pb-0 warnings">
    <div v-for="warning of warnings" class="alert alert-warning fade show">
      <p>{{ formatDate(warning.date) }}: You have received a warning: <span class="warningDescription">{{ warning.text }}</span></p>
    </div>
  </div>
</template>
<script>
import GameHelper from "../../services/gameHelper";

export default {
  props: {
    warnings: Array
  },
  methods: {
    formatDate(date) {
      return GameHelper.getDateString(date)
    }
  }
}
</script>
<style scoped>
.warningDescription {
  font-weight: bold;
}
</style>
