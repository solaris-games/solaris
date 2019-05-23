<template>
    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
        </ul>
    </p>
</template>

<script>
import router from '../router';

export default {
    props: {
        errors: Array
    }
}
</script>

<style scoped>

</style>
