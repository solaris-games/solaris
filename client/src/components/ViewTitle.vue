<template>
<div>
    <h1>{{ title }}</h1>

    <button v-if="navigation" @click="navigate">Home</button>
</div>
</template>

<script>
import router from '../router';

export default {
    props: {
        title: null,
        navigation: null
    },
    methods: {
        navigate() {
            router.push({ name: this.navigation });
        }
    }
}
</script>

<style scoped>

</style>
