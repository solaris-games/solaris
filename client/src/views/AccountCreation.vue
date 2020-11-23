<template>
  <view-container>
    <view-title title="Create Account" navigation="home"/>

    <div class="row">
      <div class="col-sm-12 col-md-6">
        <h4>Sign up to play <span class="text-warning">Solaris</span>!</h4>
        <p>Discover a space strategy game filled with conquest, betrayal and subterfuge.</p>
        <p>Build alliances, make enemies and fight your way to victory to <span class="text-danger">galactic domination.</span></p>
        <p><span class="text-info">Research and improve technologies</span> to gain an edge over your opponents. Trade with allies and build up huge fleets of ships.</p>
        <p>Will you conquer the galaxy?</p>
      </div>
      <div class="col-sm-12 col-md-6">
        <form-error-list v-bind:errors="errors"/>

        <form @submit="handleSubmit">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" required="required" class="form-control" name="email" v-model="email" :disabled="isLoading">
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" required="required" class="form-control" name="username" minlength="3" maxlength="24" v-model="username" :disabled="isLoading">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" required="required" class="form-control" name="password" v-model="password" :disabled="isLoading">
          </div>

          <div class="form-group">
            <label for="passwordConfirm">Re-enter Password</label>
            <input type="password" required="required" class="form-control" name="passwordConfirm" v-model="passwordConfirm" :disabled="isLoading">
          </div>

          <div class="form-group">
            <div class="row">
              <div class="col-6">
                <button type="submit" class="btn btn-success btn-block" :disabled="isLoading">Register</button>
              </div>
              <div class="col-6">
                <router-link to="/" tag="button" class="btn btn-danger btn-block">Cancel</router-link>
              </div>
            </div>
          </div>
        </form>

        <loading-spinner :loading="isLoading"/>
      </div>
    </div>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import router from '../router'
import ViewTitle from '../components/ViewTitle'
import FormErrorList from '../components/FormErrorList'
import userService from '../services/api/user'

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
      email: null,
      username: null,
      password: null,
      passwordConfirm: null
    }
  },
  methods: {
    async handleSubmit (e) {
      this.errors = []

      if (!this.email) {
        this.errors.push('Email required.')
      }

      if (!this.username) {
        this.errors.push('Username required.')
      }

      if (!this.password) {
        this.errors.push('Password required.')
      }

      if (!this.passwordConfirm) {
        this.errors.push('Password confirmation required.')
      }

      if (this.password !== this.passwordConfirm) {
        this.errors.push('Passwords must match.')
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        this.isLoading = true

        // Call the account create API endpoint
        let response = await userService.createUser(this.email, this.username, this.password)

        if (response.status === 201) {
          this.$toasted.show(`Account created! Welcome ${this.username}!`, { type: 'success' })

          router.push({ name: 'home' })
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
