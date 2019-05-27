<template>
<div class="row bg-primary mb-3">
    <h4 class="container mt-3 mb-3">{{ title }}</h4>
</div>
</template>

<script>
import router from '../router';

export default {
    props: {
        title: String
    }
}
</script>

<style scoped>
</style>
