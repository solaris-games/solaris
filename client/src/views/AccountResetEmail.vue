<template>
  <div class="container bg-light">
    <view-title title="Reset Email Address" />

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">New Email Address</label>
        <input type="email" required="required" class="form-control" v-model="email" />
      </div>

      <form-error-list v-bind:errors="errors"/>

      <div>
        <router-link to="/account/settings" tag="button" class="btn btn-danger">Cancel</router-link>
        <button type="submit" class="btn btn-success ml-1">Change Email</button>
      </div>
    </form>
  </div>
</template>

<script>
import router from '../router'
import ViewTitle from '../components/ViewTitle'
import FormErrorList from '../components/FormErrorList'
import apiService from '../services/apiService'

export default {
  components: {
    'view-title': ViewTitle,
    'form-error-list': FormErrorList
  },
  data () {
    return {
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
        await apiService.updateEmailAddress(this.email)

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
