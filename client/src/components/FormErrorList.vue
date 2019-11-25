<template>
    <p v-if="errors.length">
        <b class="text-danger">Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
        </ul>
    </p>
</template>

<script>
export default {
  props: {
    errors: Array
  }
}
</script>

<style scoped>

</style>
