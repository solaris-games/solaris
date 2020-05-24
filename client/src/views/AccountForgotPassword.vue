<template>
  <view-container>
    <view-title title="Forgot Password" navigation="home"/>

    <form-error-list v-bind:errors="errors"/>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" required="required" class="form-control" name="email" v-model="email" :disabled="isLoading">
      </div>

      <div>
        <button type="submit" class="btn btn-success" :disabled="isLoading">Reset Password</button>
        <router-link to="/" tag="button" class="btn btn-danger float-right">Cancel</router-link>
      </div>
    </form>

    <loading-spinner :loading="isLoading"/>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import router from '../router'
import ViewTitle from '../components/ViewTitle'
import FormErrorList from '../components/FormErrorList'

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
      username: null,
      password: null
    }
  },
  methods: {
    handleSubmit (e) {
      this.errors = []

      if (!this.email) {
        this.errors.push('Email required.')
      }

      e.preventDefault()

      if (this.errors.length) return

      this.isLoading = true

      // TODO: Call the password reset API endpoint

      this.isLoading = false

      router.push({ name: 'home' })
    }
  }
}
</script>

<style scoped>
</style>
