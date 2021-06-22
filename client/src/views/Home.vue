<template>
  <view-container :hideTopBar="true">
    <view-title title="Welcome to Solaris" :hideHomeButton="true" :showSocialLinks="true" />

    <div class="row">
      <div class="col-sm-12 col-md-6 pb-3">
        <p>Discover a space strategy game filled with conquest, betrayal and subterfuge.</p>
        <p>Build alliances, make enemies and fight your way to victory to <span class="text-danger">galactic domination.</span></p>
        <p>Will you conquer the galaxy?</p>
        <a :href="documentationUrl" target="_blank">Learn more...</a>
      </div>
      <div class="col-sm-12 col-md-6">
        <h4>Login</h4>

        <loading-spinner :loading="isAutoLoggingIn"/>

        <account-login v-if="!isAutoLoggingIn"></account-login>
      </div>
    </div>

    <div class="row">
      <img :src="require('../assets/screenshots/game1.png')" class="img-fluid w-100"/>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import AccountLoginVue from './AccountLogin'
import ApiAuthService from '../services/api/auth'
import router from '../router'
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'account-login': AccountLoginVue,
    'loading-spinner': LoadingSpinnerVue
  },
  data () {
    return {
      isAutoLoggingIn: false
    }
  },
  async mounted () {
    this.isAutoLoggingIn = true
    
    try {
      let response = await ApiAuthService.verify()

      if (response.status === 200) {
        if (response.data._id) {
          this.$store.commit('setUserId', response.data._id)
          this.$store.commit('setUsername', response.data.username)

          router.push({ name: 'main-menu' })
        }
      }
    } catch (err) {
      console.error(err)
    }

    this.isAutoLoggingIn = false
  },
  computed: {
    documentationUrl () {
      return process.env.VUE_APP_DOCUMENTATION_URL
    }
  }
}
</script>

<style scoped>
img {
  object-fit: cover;
}
</style>
