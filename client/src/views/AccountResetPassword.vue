<template>
  <view-container>
    <view-title title="Reset Password" />

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="currentPassword">Current Password</label>
        <input type="password" required="required" name="currentPassword" class="form-control" v-model="currentPassword">
      </div>

      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input type="password" required="required" name="newPassword" class="form-control" v-model="newPassword">
      </div>

      <div class="form-group">
        <label for="newPasswordConfirm">Confirm New Password</label>
        <input type="password" required="required" name="newPasswordConfirm" class="form-control" v-model="newPasswordConfirm">
      </div>

      <form-error-list v-bind:errors="errors"/>

      <div>
        <router-link to="/account/settings" tag="button" class="btn btn-danger">Cancel</router-link>
        <button type="submit" class="btn btn-success ml-1">Change Password</button>
      </div>
    </form>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import router from '../router'
import ViewTitle from '../components/ViewTitle'
import FormErrorList from '../components/FormErrorList'
import apiService from '../services/apiService'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'form-error-list': FormErrorList
  },
  data () {
    return {
      errors: [],
      currentPassword: null,
      newPassword: null,
      newPasswordConfirm: null
    }
  },
  methods: {
    async handleSubmit (e) {
      this.errors = []

      if (!this.currentPassword) {
        this.errors.push('Current password required.')
      }

      if (!this.newPassword) {
        this.errors.push('New password required.')
      }

      if (!this.newPasswordConfirm) {
        this.errors.push('New password confirmation required.')
      }

      if (this.newPassword !== this.newPasswordConfirm) {
        this.errors.push('Passwords must match.')
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        await apiService.updatePassword(this.currentPassword, this.newPassword)

        router.push({ name: 'main-menu' })
      } catch (err) {
        this.errors = err.response.data.errors || []
      }
    }
  }
}
</script>

<style scoped>
</style>
