<template>
  <div>
    <view-title title="Account" navigation="main-menu"/>Galactic Credits:
    <span>{{ credits }} Credits</span>
    <br>Username:
    <span>{{ username }}</span>
    <br>Email Address:
    <span>{{ email }}</span>
    <br>Email Enabled:
    <input type="checkbox" v-model="emailEnabled">
    <br>

    <div>
      <router-link to="/account/reset-email" tag="button">Change Email Address</router-link>
      <router-link to="/account/reset-password" tag="button">Change Password</router-link>
    </div>
  </div>
</template>

<script>
import ViewTitle from "../components/ViewTitle";

export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
    return {
      credits: 0,
      username: null,
      email: null,
      emailEnabled: true
    };
  }
};
</script>

<style scoped>
</style>
