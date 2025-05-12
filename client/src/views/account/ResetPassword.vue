<template>
  <view-container>
    <view-title title="Reset Password" />

    <form @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="currentPassword">Current Password</label>
        <input type="password" required="required" name="currentPassword" class="form-control" v-model="currentPassword"
          :disabled="isLoading">
      </div>

      <div class="mb-2">
        <label for="newPassword">New Password</label>
        <input type="password" required="required" name="newPassword" class="form-control" v-model="newPassword"
          :disabled="isLoading">
      </div>

      <div class="mb-2">
        <label for="newPasswordConfirm">Confirm New Password</label>
        <input type="password" required="required" name="newPasswordConfirm" class="form-control"
          v-model="newPasswordConfirm" :disabled="isLoading">
      </div>

      <form-error-list v-bind:errors="errors" />

      <div>
        <button type="submit" class="btn btn-success" :disabled="isLoading">Change Password</button>
        <router-link to="/account/settings" tag="button" class="btn btn-danger float-end">Cancel</router-link>
      </div>
    </form>

    <loading-spinner :loading="isLoading" />
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import { inject } from 'vue'
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi'
import { updatePassword } from '@/services/typedapi/user'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'form-error-list': FormErrorList
  },
  setup() {
    return {
      httpClient: inject(httpInjectionKey),
    };
  },
  data() {
    return {
      isLoading: false,
      errors: [],
      currentPassword: null,
      newPassword: null,
      newPasswordConfirm: null
    }
  },
  methods: {
    async handleSubmit(e) {
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

      this.isLoading = true

      const response = await updatePassword(this.httpClient)(this.currentPassword, this.newPassword)

      if (isOk(response)) {
        this.$toast.success(`Password updated.`)
        router.push({ name: 'account-settings' })
      } else {
        console.error(formatError(response));
        this.errors = extractErrors(response);
        this.$toast.error(`There was a problem updating your password, please try again.`)
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped></style>
