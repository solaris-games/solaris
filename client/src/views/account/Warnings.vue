<template>
  <div class="row pb-0 warnings">
    <div v-for="warning of warnings" class="alert alert-warning fade show">
      <p>{{ formatDate(warning.date) }}: You have received a warning for: <span class="warningDescription">{{ toDescription(warning.kind) }}</span></p>
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
    },
    toDescription(warningKind) {
      switch (warningKind) {
        case 'afk':
          return 'frequent inactivity'
        case 'cheating':
          return 'cheating'
        case 'abusive':
          return 'abusive behaviour'
        case 'other':
          return 'other'
      }
    }
  }
}
</script>
<style scoped>
.warningDescription {
  font-weight: bold;
}
</style>
