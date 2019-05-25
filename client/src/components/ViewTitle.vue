<template>
<div>
    <div class="row">
        <div class="col">
            <h1>{{ title }}</h1>
        </div>
        <div class="col-1">
            <button v-if="navigation" @click="navigate" id="btnHome" class="btn btn-primary float-right"><i v-bind:class="'fas fa-' + icon"></i></button>
        </div>
    </div>
</div>
</template>

<script>
import router from '../router';

export default {
    props: {
        title: String,
        navigation: { type:String, default: 'main-menu' },
        icon: { type: String, default: 'home' }
    },
    methods: {
        navigate() {
            router.push({ name: this.navigation });
        }
    }
}
</script>

<style scoped>
#btnHome {
    margin-top: 10px;
}
</style>
