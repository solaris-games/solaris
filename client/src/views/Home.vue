<template>
  <view-container>
    <div class="row bg-primary pt-3 pb-2 mb-2">
      <div class="col">
          <h3>Welcome to Solaris</h3>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12 col-md-6">
        <p>The multiplayer game of Strategy, Intrigue and Galactic Conquest.</p>
        <h4>A board game for the web!</h4>
        <p>Login throughout the day to command epic fleets of spacecraft in a desperate struggle to conquer the galaxy!</p>
      </div>
      <div class="col-sm-12 col-md-6">
        <h4>Login</h4>
        <account-login></account-login>
      </div>
    </div>

    <div class="row">
      <img :src="require('../assets/screenshots/game1.png')" class="img-fluid w-100"/>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import AccountLoginVue from './AccountLogin'

export default {
  components: {
    'view-container': ViewContainer,
    'account-login': AccountLoginVue
  }
}
</script>

<style scoped>
</style>
