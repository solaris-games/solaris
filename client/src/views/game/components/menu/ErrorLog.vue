<template>
  <div>
    <h3>Error Log</h3>
    <p v-for="error in errors()" :key="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">

const errors = () => window?._solaris?.errors || [];
</script>

<style scoped>

</style>
