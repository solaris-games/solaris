<template>
  <div>
    <view-title title="Reset Email Address" />

    <form-error-list v-bind:errors="errors"/>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email">Email Address</label>
        <input type="email" name="email" v-model="email">
      </div>

      <div>
        <router-link to="/main-menu" tag="button">Cancel</router-link>
        <button type="submit">Change Email</button>
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
      email: null
    };
  },
  methods: {
    handleSubmit(e) {
      this.errors = [];

      if (!this.email) {
        this.errors.push("Email address required.");
      }

      e.preventDefault();

      if (this.errors.length) return;

      // TODO: Call the email reset API endpoint

      router.push({ name: "main-menu" });
    }
  }
};
</script>

<style scoped>
</style>
