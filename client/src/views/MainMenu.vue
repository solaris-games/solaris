<template>
  <div>
    <h1>Main Menu</h1>

    <div>
      <router-link to="/game/active-games" tag="button">My Games</router-link>
      <router-link to="/game/list" tag="button">Join Game</router-link>
      <router-link to="/game/create" tag="button">Create Game</router-link>
    </div>

    <div>
      <router-link to="/account/achievements" tag="button">Achievements</router-link>
      <router-link to="/account/settings" tag="button">Account Settings</router-link>
      <router-link to="/codex" tag="button">Help</router-link>
    </div>

    <div>
      <router-link to="/premium-store" tag="button">Premium Store</router-link>
    </div>

    <div>
      <button @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
import router from "../router";

export default {
  methods: {
    logout() {
      // TODO: Log the user out.

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
