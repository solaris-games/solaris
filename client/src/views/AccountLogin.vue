<template>
  <div>
    <h1>Login</h1>

    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
        </ul>
    </p>

    <form @submit.prevent="handleSubmit">

      <div>
        <label for="username">Username</label>
        <input type="text" name="username" v-model="username">
      </div>

      <div>
        <label for="password">Password</label>
        <input type="password" name="password" v-model="password">
      </div>

      <div>
          <router-link to="/" tag="button">Cancel</router-link>
          <button type="submit">Login</button>
      </div>

      <div>
          <router-link to="/account/password-reset" tag="button">Reset Password</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import router from '../router';

export default {
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

            if (!this.username) {
                this.errors.push('Username required.');
            }

            if (!this.password) {
                this.errors.push('Password required.');
            }

            e.preventDefault();

            if (this.errors.length)
                return;

            // TODO: Call the login API endpoint

            router.push({ name: 'main-menu'});
        }
    }
};
</script>

<style scoped>
</style>
