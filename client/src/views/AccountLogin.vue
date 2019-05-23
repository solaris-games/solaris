<template>
  <div>
    <view-title title="Login" navigation="home"/>

    <form-error-list v-bind:errors="errors"/>

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
        <router-link to="/account/forgot-password" tag="button">Forgot Password</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import router from "../router";
import ViewTitle from "../components/ViewTitle";
import FormErrorList from "../components/FormErrorList";

export default {
  components: {
    "view-title": ViewTitle,
    "form-error-list": FormErrorList
  },
  data() {
    return {
      errors: [],
      username: null,
      password: null
    };
  },
  methods: {
    handleSubmit(e) {
      this.errors = [];

      if (!this.username) {
        this.errors.push("Username required.");
      }

      if (!this.password) {
        this.errors.push("Password required.");
      }

      e.preventDefault();

      if (this.errors.length) return;

      // Call the login API endpoint
      axios.post('http://localhost:3000/api/auth/login', {
        username: this.username,
        password: this.password
      })
      .then(response => {
        if (response.status === 200) {
          router.push({ name: "main-menu" });
        } else {
          this.errors = response.data.errors || [];
        }
      });
    }
  }
};
</script>

<style scoped>
</style>
