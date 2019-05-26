<template>
  <div class="container">
    <view-title title="Game Info" navigation="game-list"/>

    {{ id }}
  </div>
</template>

<script>
import ViewTitle from "../components/ViewTitle";
import router from '../router'
export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
      return {
          id: null
      }
  },
  created() {
      this.id = this.$route.query.id;
  }
};
</script>

<style scoped>
</style>
