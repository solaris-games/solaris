<template>
  <view-container>
    <view-title title="Reset Email Address" />

    <form @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="email">New Email Address</label>
        <input type="email" required="required" class="form-control" v-model="email" :disabled="isLoading" />
      </div>

      <form-error-list v-bind:errors="errors" />

      <div>
        <button type="submit" class="btn btn-success" :disabled="isLoading">Change Email</button>
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
import { updateEmailAddress } from '@/services/typedapi/user'

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
    }
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
        this.errors.push('Email address required.')
      }

      e.preventDefault()

      if (this.errors.length) {
        return;
      };

      this.isLoading = true;

      const response = await updateEmailAddress(this.httpClient)(this.email);

      if (isOk(response)) {
        this.$toast.success(`Email address updated.`)
        router.push({ name: 'account-settings' })
      } else {
        console.error(formatError(response));
        this.errors = extractErrors(response);
        this.$toast.error(`There was a problem updating your email address, please try again.`)
      }

      this.isLoading = false;
    }
  }
}
</script>

<style scoped></style>
