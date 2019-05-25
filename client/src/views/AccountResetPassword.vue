<template>
  <div>
    <view-title title="Reset Password" />

    <form-error-list v-bind:errors="errors"/>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="currentPassword">Current Password</label>
        <input type="password" name="currentPassword" v-model="currentPassword">
      </div>

      <div>
        <label for="newPassword">New Password</label>
        <input type="password" name="newPassword" v-model="newPassword">
      </div>

      <div>
        <label for="newPasswordConfirm">Confirm New Password</label>
        <input type="password" name="newPasswordConfirm" v-model="newPasswordConfirm">
      </div>

      <div>
        <router-link to="/account/settings" tag="button" class="btn btn-danger">Cancel</router-link>
        <button type="submit" class="btn btn-success">Change Password</button>
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
      currentPassword: null,
      newPassword: null,
      newPasswordConfirm: null
    };
  },
  methods: {
    handleSubmit(e) {
      this.errors = [];

      if (!this.currentPassword) {
        this.errors.push("Current password required.");
      }

      if (!this.newPassword) {
        this.errors.push("New password required.");
      }

      if (!this.newPasswordConfirm) {
        this.errors.push("New password confirmation required.");
      }

      if (this.newPassword !== this.newPasswordConfirm) {
        this.errors.push("Passwords must match.");
      }

      e.preventDefault();

      if (this.errors.length) return;

      // TODO: Call the password reset API endpoint

      router.push({ name: "main-menu" });
    }
  }
};
</script>

<style scoped>
</style>
