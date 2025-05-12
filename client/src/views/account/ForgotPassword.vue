<template>
  <view-container>
    <view-title title="Forgot Password" navigation="home" />

    <form-error-list v-bind:errors="errors" />

    <form @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="email">Email Address</label>
        <input type="email" required="required" class="form-control" name="email" v-model="email" :disabled="isLoading">
      </div>

      <div>
        <button type="submit" class="btn btn-success" :disabled="isLoading">Reset Password</button>
        <router-link to="/" tag="button" class="btn btn-danger float-end">Cancel</router-link>
      </div>
    </form>

    <p class="mt-3">Not receiving emails? Contact a developer on <a
        href="https://discord.com/invite/v7PD33d">Discord</a>.</p>

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
      email: null
    }
  },
  methods: {
    async handleSubmit(e) {
      this.errors = []

      if (!this.email) {
        this.errors.push('Email required.')
      }

      e.preventDefault()

      if (this.errors.length) {
        return;
      }

      this.isLoading = true

      const response = await requestResetPassword(this.httpClient)(this.email);

      if (isOk(response)) {
        this.$toast.success(`A password reset email has been sent to the email address, please check your email inbox.`)
      } else {
        console.error(formatError(response));
        this.errors = extractErrors(response);
        this.$toast.error(`There was a problem resetting your password, please check that you entered your email address correctly.`)
      }

      router.push({ name: 'home' })

      this.isLoading = false
    }
  }
}
</script>

<style scoped></style>
