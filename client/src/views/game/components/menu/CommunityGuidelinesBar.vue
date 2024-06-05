<template>
  <div class="row bg-primary mb-4 p-1" title="Community Guidelines">
    <p class="guidelines-text">
      By playing Solaris, you agree to the <router-link class="guidelines-link" :to="{ name: 'guidelines' }">Community Guidelines</router-link>
    </p>
  </div>
</template>

<script>

export default {
  name: "CommunityGuidelinesBar",
}
</script>

<style scoped>
.guidelines-text {
  color: white;
}

.guidelines-link {
  color: white;
  text-decoration: underline;
  font-weight: bold;
  display: inline;
}
</style>
