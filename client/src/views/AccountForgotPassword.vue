<template>
  <div>
    <view-title title="Forgot Password" navigation="home"/>

    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
        </ul>
    </p>

    <form @submit.prevent="handleSubmit">

      <div>
        <label for="email">Email Address</label>
        <input type="email" name="email" v-model="email">
      </div>

      <div>
          <router-link to="/" tag="button">Cancel</router-link>
          <button type="submit">Reset Password</button>
      </div>
    </form>
  </div>
</template>

<script>
import router from '../router';
import ViewTitle from '../components/ViewTitle';

export default {
    components: {
        'view-title': ViewTitle
    },
    data() {
        return {
            errors: [],
            username: null,
            password: null
        }
    },
    methods: {
        handleSubmit(e) {
            this.errors = [];

            if (!this.email) {
                this.errors.push('Email required.');
            }

            e.preventDefault();

            if (this.errors.length)
                return;

            // TODO: Call the password reset API endpoint

            router.push({ name: 'home'});
        }
    }
};
</script>

<style scoped>
</style>
