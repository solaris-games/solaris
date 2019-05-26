<template>
  <div>
    <view-title title="Reset Email Address" />

    <form-error-list v-bind:errors="errors"/>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">New Email Address</label>
        <input type="email" class="form-control" v-model="email" />
      </div>

      <div>
        <router-link to="/account/settings" tag="button" class="btn btn-danger">Cancel</router-link>
        <button type="submit" class="btn btn-success">Change Email</button>
      </div>
    </form>
  </div>
</template>

<script>
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
      email: null
    };
  },
  methods: {
    async handleSubmit(e) {
      this.errors = [];

      if (!this.email) {
        this.errors.push("Email address required.");
      }

      e.preventDefault();

      if (this.errors.length) return;

      try {
        await apiService.updateEmailAddress(this.email);
      } catch(err) {
        console.error(err);
      }

      router.push({ name: "main-menu" });
    }
  }
};
</script>

<style scoped>
</style>
