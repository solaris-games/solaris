<template>
<span v-if="user && user.achievements" title="ELO Rating"><i class="fas fa-chess-knight me-1"></i>{{user.achievements.eloRating || 1200}}</span>
</template>

<script>
export default {
  props: {
    user: Object
  }
}
</script>

<style scoped>
</style>
