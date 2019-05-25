<template>
  <div>
    <view-title title="Active Games" />

    <div v-if="!games.length">
        <p>You are not in any active games.</p>
        
        <router-link to="/game/list" tag="button">Join Game</router-link>
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
          games: []
      };
  }
};
</script>

<style scoped>
</style>
