<template>
  <div class="container">
    <view-title title="Create Account" navigation="home"/>

    <form-error-list v-bind:errors="errors"/>

    <form @submit="handleSubmit">
      <div>
        <label for="username">Username</label>
        <input type="text" name="username" v-model="username">
      </div>

      <div>
        <label for="email">Email Address</label>
        <input type="email" name="email" v-model="email">
      </div>

      <div>
        <label for="password">Password</label>
        <input type="password" name="password" v-model="password">
      </div>

      <div>
        <label for="passwordConfirm">Re-enter Password</label>
        <input type="password" name="passwordConfirm" v-model="passwordConfirm">
      </div>

      <div>
        <router-link to="/" tag="button" class="btn btn-danger">Cancel</router-link>
        <button type="submit" class="btn btn-success">Create Account</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import router from "../router";
import ViewTitle from "../components/ViewTitle";
import FormErrorList from "../components/FormErrorList";
import apiService from '../services/apiService';

export default {
  components: {
    "view-title": ViewTitle,
    "form-error-list": FormErrorList
  },
  data() {
    return {
      errors: [],
      username: null,
      email: null,
      password: null,
      passwordConfirm: null
    };
  },
  methods: {
    async handleSubmit(e) {
      this.errors = [];

      if (!this.username) {
        this.errors.push("Username required.");
      }

      if (!this.email) {
        this.errors.push("Email required.");
      }

      if (!this.password) {
        this.errors.push("Password required.");
      }

      if (!this.passwordConfirm) {
        this.errors.push("Password confirmation required.");
      }

      if (this.password !== this.passwordConfirm) {
        this.errors.push("Passwords must match.");
      }

      e.preventDefault();

      if (this.errors.length) return;

		try {
			// Call the account create API endpoint
			let response = await apiService.createUser(this.username, this.email, this.password);

			if (response.status === 201) {
				router.push({ name: "main-menu" });
			}
		} catch (err) {
			this.errors = err.response.data.errors || [];
		}
    }
  }
};
</script>

<style scoped>
</style>
