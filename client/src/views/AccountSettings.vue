<template>
  <view-container>
    <view-title title="Account" />

    <loading-spinner :loading="!info"/>
    
    <div v-if="info">
      <!--
      <div class="row pt-3 pb-3 bg-info">
        <div class="col">
          <p>Galactic Credits</p>
        </div>
        <div class="col">
          <p class="text-right">{{ info.credits }} Credits</p>
        </div>
      </div>
      -->

      <div class="row pt-3 pb-3 bg-primary">
        <div class="col">
          <p>Username</p>
        </div>
        <div class="col">
          <p class="text-right">
            {{ info.username }}
            <router-link to="/account/reset-username" tag="a"><i class="fas fa-pencil-alt"></i></router-link>
          </p>
        </div>
      </div>

      <div class="row pt-3 pb-3 bg-secondary">
        <div class="col">
          <p>Email Address</p>
        </div>
        <div class="col">
          <p class="text-right">
            {{ info.email }}
            <router-link to="/account/reset-email" tag="a"><i class="fas fa-pencil-alt"></i></router-link>
          </p>
        </div>
      </div>

      <div class="row pt-3 pb-3 bg-primary">
        <div class="col">
          <p>Email Notifications</p>
        </div>
        <div class="col text-right">
          <button v-if="info.emailEnabled" :disabled="isChangingEmailNotifications" @click="toggleEmailNotifications(false)" class="btn btn-success">
            Enabled
            <i class="fas fa-check"></i>
          </button>
          <button v-if="!info.emailEnabled" :disabled="isChangingEmailNotifications" @click="toggleEmailNotifications(true)" class="btn btn-danger">
            Disabled
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <router-link to="/account/reset-password" tag="button" class="btn btn-primary">Change Password</router-link>
    </div>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import userService from '../services/api/user'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle
  },
  data () {
    return {
      info: null,
      isChangingEmailNotifications: false
    }
  },
  async mounted () {
    let response = await userService.getMyUserInfo()

    if (response.status === 200) {
      this.info = response.data
    }
  },
  methods: {
    async toggleEmailNotifications (enabled) {
      this.info.emailEnabled = enabled

      try {
        this.isChangingEmailNotifications = true

        await userService.toggleEmailNotifications(this.info.emailEnabled)
      } catch (err) {
        console.error(err)
      }

      this.isChangingEmailNotifications = false
    }
  }
}
</script>

<style scoped>
p {
  margin-bottom: 0;
}
</style>
