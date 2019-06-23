<template>
<div class="container bg-secondary">
    <h3 class="pt-2">Welcome</h3>

    <select-race />
    <select-alias v-on:onAliasChanged="onAliasChanged"/>
    <select-location />

    <form-error-list v-bind:errors="errors"/>

    <div class="mb-2">
        <button type="button" class="btn btn-success btn-block" @click="join">Join Game</button>
    </div>
</div>
</template>

<script>
import FormErrorListVue from '../../FormErrorList';
import SelectRaceVue from './SelectRace.vue';
import SelectAliasVue from './SelectAlias.vue';
import SelectLocationVue from './SelectLocation.vue';

export default {
    components: {
        'form-error-list': FormErrorListVue,
        'select-race': SelectRaceVue,
        'select-alias': SelectAliasVue,
        'select-location': SelectLocationVue
    },
    data() {
        return {
            errors: [],
            _alias: ''
        };
    },
    methods: {
        onAliasChanged(e) {
            this._alias = e;
        },
        join() {
            this.errors = [];

            if (!this._alias) {
                this.errors.push("Alias is required.");
            }

            if (this._alias.length < 3) {
                this.errors.push("Alias must be 3 characters or more.");
            }

            if (this._alias.length > 24) {
                this.errors.push("Alias must less than 24 characters.");
            }

            if (this.errors.length) return;
        }
    }
}
</script>

<style scoped>
</style>
