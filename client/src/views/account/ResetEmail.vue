<template>
  <view-container>
    <view-title title="Reset Email Address" />

    <form @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="email">New Email Address</label>
        <input type="email" required="required" class="form-control" v-model="email" :disabled="isLoading"/>
      </div>

      <form-error-list v-bind:errors="errors"/>

      <div>
        <button type="submit" class="btn btn-success" :disabled="isLoading">Change Email</button>
        <router-link to="/account/settings" tag="button" class="btn btn-danger float-end">Cancel</router-link>
      </div>
    </form>

    <loading-spinner :loading="isLoading"/>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import userService from '../../services/api/user'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'form-error-list': FormErrorList
  },
  data () {
    return {
      isLoading: false,
      errors: [],
      email: null
    }
  },
  methods: {
    async handleSubmit (e) {
      this.errors = []

      if (!this.email) {
        this.errors.push('Email address required.')
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        this.isLoading = true

        let response = await userService.updateEmailAddress(this.email)

        if (response.status === 200) {
          this.$toast.success(`Email address updated.`)
          router.push({ name: 'account-settings' })
        } else {
          this.$toast.error(`There was a problem updating your email address, please try again.`)
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped>
</style>
