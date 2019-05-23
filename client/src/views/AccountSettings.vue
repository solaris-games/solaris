<template>
  <div>
    <view-title title="Account" navigation="main-menu"/>Galactic Credits:
    <span>{{ info.credits }} Credits</span>
    <br>Username:
    <span>{{ info.username }}</span>
    <br>Email Address:
    <span>{{ info.email }}</span>
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
import axios from 'axios';
import ViewTitle from "../components/ViewTitle";

export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
    return {
      info: null
    };
  },
  mounted() {
    axios.get('http://localhost:3000/api/user/me', { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          this.info = response.data;
        }
      });
  }
};
</script>

<style scoped>
</style>
