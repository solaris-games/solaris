<template>
  <view-container>
    <view-title title="Login" navigation="home"/>

    <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <input type="text" required="required" class="form-control" placeholder="Username" v-model="username" :disabled="isLoading"/>
        </div>

        <div class="form-group">
            <input type="password" required="required" class="form-control" placeholder="Password" v-model="password"  :disabled="isLoading"/>
        </div>

        <form-error-list v-bind:errors="errors"/>

        <div class="form-group">
            <input type="submit" class="btn btn-success" value="Login" :disabled="isLoading"/>
            <router-link to="/" tag="button" type="button" class="btn btn-danger float-right">Cancel</router-link>
        </div>

        <div class="form-group">
            <router-link to="/account/forgot-password">Forgot Password?</router-link>
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
import authService from '../services/api/auth'

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
    async handleSubmit (e) {
      this.errors = []

      if (!this.username) {
        this.errors.push('Username required.')
      }

      if (!this.password) {
        this.errors.push('Password required.')
      }

      e && e.preventDefault()

      if (this.errors.length) return

      try {
        this.isLoading = true

        // Call the login API endpoint
        let response = await authService.login(this.username, this.password)

        if (response.status === 200) {
          this.$store.commit('setUserId', response.data.id)

          router.push({ name: 'main-menu' })
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
