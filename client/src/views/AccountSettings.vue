<template>
  <div>
    <view-title title="Account" />Galactic Credits:
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
import apiService from '../services/apiService';

export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
    return {
      info: null
    };
  },
  async mounted() {
    let response = await apiService.getUserInfo();
      
    if (response.status === 200) {
      this.info = response.data;
    }
  }
};
</script>

<style scoped>
</style>
