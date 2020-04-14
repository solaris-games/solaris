<template>
  <view-container>
    <view-title title="Create Account" navigation="home"/>

    <form-error-list v-bind:errors="errors"/>

    <form @submit="handleSubmit">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" required="required" class="form-control" name="username" v-model="username">
      </div>

      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" required="required" class="form-control" name="email" v-model="email">
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" required="required" class="form-control" name="password" v-model="password">
      </div>

      <div class="form-group">
        <label for="passwordConfirm">Re-enter Password</label>
        <input type="password" required="required" class="form-control" name="passwordConfirm" v-model="passwordConfirm">
      </div>

      <div>
        <router-link to="/" tag="button" class="btn btn-danger">Cancel</router-link>
        <button type="submit" class="btn btn-success ml-1">Create Account</button>
      </div>
    </form>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import router from '../router'
import ViewTitle from '../components/ViewTitle'
import FormErrorList from '../components/FormErrorList'
import userService from '../services/api/user'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'form-error-list': FormErrorList
  },
  data () {
    return {
      errors: [],
      username: null,
      email: null,
      password: null,
      passwordConfirm: null
    }
  },
  methods: {
    async handleSubmit (e) {
      this.errors = []

      if (!this.username) {
        this.errors.push('Username required.')
      }

      if (!this.email) {
        this.errors.push('Email required.')
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
        // Call the account create API endpoint
        let response = await userService.createUser(this.username, this.email, this.password)

        if (response.status === 201) {
          this.$store.commit('setUserId', response.data.id)

          router.push({ name: 'account-login' })
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }
    }
  }
}
</script>

<style scoped>
</style>
