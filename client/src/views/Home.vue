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

    <div class="row mb-3">
      <img :src="require('../assets/screenshots/game1.png')" class="img-fluid w-100"/>
    </div>

    <!-- <div class="row">
      <div class="col-12 col-lg-6">
        <recent-donations :maxLength="null" />
      </div>
      <div class="d-none d-lg-block col-6">
        <iframe src="https://discord.com/widget?id=686524791943069734&theme=dark" style="width:100%;height:100%" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
      </div>
    </div> -->
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import AccountLoginVue from './AccountLogin'
import ApiAuthService from '../services/api/auth'
import router from '../router'
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'
import RecentDonationsVue from '../components/game/donate/RecentDonations.vue'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'account-login': AccountLoginVue,
    'loading-spinner': LoadingSpinnerVue,
    'recent-donations': RecentDonationsVue
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
          this.$store.commit('setRoles', response.data.roles)

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
