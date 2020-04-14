<template>
  <view-container>
    <view-title title="Account" />

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
        <p class="text-right">{{ info.username }}</p>
      </div>
    </div>

    <div class="row pt-3 pb-3 bg-secondary">
      <div class="col">
        <p>Email Address</p>
      </div>
      <div class="col">
        <p class="text-right">{{ info.email }}</p>
      </div>
    </div>

    <div class="row pt-3 pb-3 bg-primary">
      <div class="col">
        <p>Email Notifications</p>
      </div>
      <div class="col text-right">
        <button v-if="info.emailEnabled" @click="toggleEmailNotifications(false)" class="btn btn-success">Enabled</button>
        <button v-if="!info.emailEnabled" @click="toggleEmailNotifications(true)" class="btn btn-danger">Disabled</button>
      </div>
    </div>

    <div class="mt-3">
      <router-link to="/account/reset-email" tag="button" class="btn btn-primary">Change Email Address</router-link>
      <router-link to="/account/reset-password" tag="button" class="btn btn-primary ml-1">Change Password</router-link>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import userService from '../services/api/user'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle
  },
  data () {
    return {
      info: null
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

      await userService.toggleEmailNotifications(this.info.emailEnabled)
    }
  }
}
</script>

<style scoped>
p {
  margin-bottom: 0;
}
</style>
