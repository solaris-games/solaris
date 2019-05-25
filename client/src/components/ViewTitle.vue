<template>
<div>
    <div class="row">
        <div class="col">
            <h1>{{ title }}</h1>
        </div>
        <div class="col-1">
            <button v-if="navigation" @click="navigate" class="float-right"><font-awesome-icon icon="house" /></button>
        </div>
    </div>
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
