<template>
  <div class="row pb-0 warnings">
    <div v-for="warning of warnings" class="alert alert-warning fade show">
      <p>{{ warning.date }}: You have received a warning for: <span class="warningDescription">{{ toDescription(warning.kind) }}</span></p>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    warnings: Array
  },
  methods: {
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
