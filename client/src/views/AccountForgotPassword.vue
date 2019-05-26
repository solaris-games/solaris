<template>
  <div class="container">
    <view-title title="Forgot Password" navigation="home"/>

    <form-error-list v-bind:errors="errors"/>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email">Email Address</label>
        <input type="email" name="email" v-model="email">
      </div>

      <div>
        <router-link to="/" tag="button" class="btn btn-danger">Cancel</router-link>
        <button type="submit" class="btn btn-success">Reset Password</button>
      </div>
    </form>
  </div>
</template>

<script>
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

      if (!this.email) {
        this.errors.push("Email required.");
      }

      e.preventDefault();

      if (this.errors.length) return;

      // TODO: Call the password reset API endpoint

      router.push({ name: "home" });
    }
  }
};
</script>

<style scoped>
</style>
