<template>
  <div class="container">
    <view-title title="Account" />

    <div class="row">
      <div class="col">
        <p>Galactic Credits</p>
      </div>
      <div class="col">
        <p class="text-right">{{ info.credits }} Credits</p>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <p>Username</p>
      </div>
      <div class="col">
        <p class="text-right">{{ info.username }}</p>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <p>Email Address</p>
      </div>
      <div class="col">
        <p class="text-right">{{ info.email }}</p>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <p>Email Notifications</p>
      </div>
      <div class="col text-right">
        <button v-if="info.emailEnabled" @click="toggleEmailNotifications(false)" class="btn btn-success">Enabled</button>
        <button v-if="!info.emailEnabled" @click="toggleEmailNotifications(true)" class="btn btn-danger">Disabled</button>
      </div>
    </div>

    <div>
      <router-link to="/account/reset-email" tag="button" class="btn btn-primary">Change Email Address</router-link>
      <router-link to="/account/reset-password" tag="button" class="btn btn-primary">Change Password</router-link>
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
  },
  methods: {
    async toggleEmailNotifications(enabled) {
      this.info.emailEnabled = enabled;

      await apiService.toggleEmailNotifications(this.info.emailEnabled);
    }
  }
};
</script>

<style scoped>
</style>
