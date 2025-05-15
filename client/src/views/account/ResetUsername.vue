<template>
  <view-container>
    <view-title title="Reset Username" />

    <form @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="username">New Username</label>
        <input type="text" required="required" class="form-control" minlength="3" maxlength="24" v-model="username"
          :disabled="isLoading" />
      </div>

      <form-error-list v-bind:errors="errors" />

      <div>
        <button type="submit" class="btn btn-success" :disabled="isLoading">Change Username</button>
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
import { updateUsername } from '@/services/typedapi/user'

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
      username: null
    }
  },
  methods: {
    async handleSubmit(e) {
      this.errors = []

      if (!this.username) {
        this.errors.push('Username required.')
      }

      e.preventDefault()

      if (this.errors.length) {
        return;
      }

      this.isLoading = true;

      const response = updateUsername(this.httpClient)(this.username);

      if (isOk(response)) {
        this.$store.commit('setUsername', this.username);
        this.$toast.success(`Username updated.`)
        router.push({ name: 'account-settings' })
      } else {
        console.error(formatError(response));
        this.errors = extractErrors(response);
        this.$toast.error(`There was a problem updating your username, please try again.`)
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped></style>
