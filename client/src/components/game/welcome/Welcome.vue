<template>
<div class="container bg-secondary">
    <h3 class="pt-2">Welcome</h3>

    <select-race v-on:onRaceChanged="onRaceChanged"/>
    <select-alias v-on:onAliasChanged="onAliasChanged"/>

    <form-error-list v-bind:errors="errors" class="mt-2"/>

    <select-location :game="game" v-on:onJoinRequested="onJoinRequested"/>

    <div class="text-center">
        <p>Invite your friends and take on the Galaxy together!</p>

        <p class="mb-0">Send them this address!</p>
        <p class="text-info"><i>{{protocol}}//{{domain}}{{$route.fullPath}}</i></p>
    </div>
</div>
</template>

<script>
import apiService from '../../../services/apiService';

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
    props: {
        game: Object
    },
    data() {
        return {
            domain: '',
            errors: [],
            _alias: '',
            _race: 38
        };
    },
    mounted() {
        this.protocol = window.location.protocol;
        this.domain = window.location.host;
    },
    methods: {
        onAliasChanged(e) {
            this._alias = e;
        },
        onRaceChanged(e) {
            this._race = e;
        },
        async onJoinRequested(playerId) {
            this.errors = [];

            if (!this._alias) {
                this.errors.push("Alias is required.");
            }

            if (this._alias && this._alias.length < 3) {
                this.errors.push("Alias must be 3 characters or more.");
            }

            if (this._alias && this._alias.length > 24) {
                this.errors.push("Alias must less than 24 characters.");
            }

            if (!this._race) {
                this.errors.push("Race is required.");
            }

            if (this.errors.length) return;
            
            try {
                let response = await apiService.joinGame(this.game._id, playerId, this._race, this._alias);

                if (response.status === 200) {
                    this.$emit('onGameJoined', playerId);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
}
</script>

<style scoped>
</style>
