<template>
  <view-container>
    <!-- DEV ONLY -->
    <router-link to="/main-menu" tag="button" class="btn btn-primary">Main Menu</router-link>

    <h1>Home</h1>

    <div>
      <router-link to="/account/create" tag="button" class="btn btn-primary">Create A New Account</router-link>
      <router-link to="/account/login" tag="button" class="btn btn-success ml-1">Login</router-link>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'

export default {
  components: {
    'view-container': ViewContainer
  }
}
</script>

<style scoped>
</style>
