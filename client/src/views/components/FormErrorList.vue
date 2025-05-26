<template>
    <div v-if="props?.errors?.length">
        <b class="text-danger">Please correct the following error(s):</b>
        <ul>
            <li v-for="error in props.errors" v-bind:key="error">{{ error }}</li>
        </ul>
      </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  errors: string[] | null,
}>();
</script>

<style scoped>

</style>
