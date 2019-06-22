<template>
<div class="container bg-secondary">
    <h3 class="pt-2">Welcome</h3>

    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2">Select a name for your commander in chief.</p>
            <p>(Step 2 of 3)</p>
        </div>
    </div>

    <div class="row bg-light">
        <div class="col">
            <form @submit.prevent="handleSubmit">
                <div class="form-group mt-2 text-center">
                    <p class="mb-0">Choose a new alias every game and play anonymously.</p>
                    <p>Every great story needs both heroes and villians. Which will you be?</p>
                </div>

                <div class="form-group">
                    <input class="form-control" required="required" type="text" v-model="alias">
                </div>

                <div class="form-group text-center small">
                    <p>Your alias must be between 3 and 24 characters and can only contain standard characters.</p>
                </div>

                <form-error-list v-bind:errors="errors"/>
        
                <div class="form-group">
                    <button type="submit" class="btn btn-success btn-block">Select</button>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import FormErrorListVue from '../../FormErrorList';

export default {
    components: {
        'form-error-list': FormErrorListVue
    },
    props: {
        
    },
    data() {
        return {
            errors: [],
            alias: ''
        }
    },
    methods: {
        handleSubmit(e) {
            this.errors = [];

            if (!this.alias) {
                this.errors.push("Alias is required.");
            }

            if (this.alias.length < 3) {
                this.errors.push("Alias must be 3 characters or more.");
            }

            if (this.alias.length > 24) {
                this.errors.push("Alias must less than 24 characters.");
            }

            e.preventDefault();

            if (this.errors.length) return;
        }
    }
}
</script>

<style scoped>
</style>
