<template>
  <view-container>
    <h1 class="pt-3">Solaris</h1>

    <p>The multiplayer game of Strategy, Intrigue and Galactic Conquest.</p>

    <div class="row">
        <div class="col">
          <router-link to="/account/create" tag="button" class="btn btn-block btn-primary">Create Account</router-link>
        </div>
        <div class="col">
          <router-link to="/account/login" tag="button" class="btn btn-block btn-success">Login</router-link>
        </div>
    </div>

    <img />

    <div class="text-center">
      <h4>A board game for the web!</h4>
      <p>Login throughout the day to command epic fleets of spacecraft in a desperate struggle to conquer the galaxy!</p>
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
