<template>
  <div>
    <h1>Main Menu</h1>

    <div>
      <router-link to="/game/active-games" tag="button" class="btn btn-success">My Games</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-success">Join Game</router-link>
      <router-link to="/game/create" tag="button" class="btn btn-primary">Create Game</router-link>
    </div>

    <div>
      <router-link to="/account/achievements" tag="button" class="btn btn-primary">Achievements</router-link>
      <router-link to="/account/settings" tag="button" class="btn btn-primary">Account Settings</router-link>
      <router-link to="/codex" tag="button" class="btn btn-primary">Help</router-link>
    </div>

    <div>
      <router-link to="/premium-store" tag="button" class="btn btn-danger">Premium Store</router-link>
    </div>

    <div>
      <button @click="logout" class="btn btn-primary">Logout</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import router from "../router";
import apiService from '../services/apiService';

export default {
  methods: {
    async logout() {
      await apiService.logout();
      
      router.push({ name: "home" });
    }
  }
};
</script>

<style scoped>
button {
  display: block;
}
</style>
