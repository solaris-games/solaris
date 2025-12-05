<template>
  <view-container :is-auth-page="false">
    <view-title title="Reset Password" />

    <form @submit.prevent="handleSubmit">
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

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import { inject, ref } from 'vue'
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi'
import { resetPassword } from '@/services/typedapi/user'
import {toastInjectionKey} from "@/util/keys";
import { useRoute } from 'vue-router'

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const route = useRoute();
const token = route.query.token;

const isLoading = ref(false);
const errors = ref<string[]>([]);
const newPassword = ref('');
const newPasswordConfirm = ref('');

const handleSubmit = (e: Event) => {
  errors.value = [];

  if (!newPassword.value) {
    errors.value.push('New password required.');
  }

  if (!newPasswordConfirm.value) {
    errors.value.push('New password confirmation required.');
  }

  if (newPassword.value !== newPasswordConfirm.value) {
    errors.value.push('Passwords must match.');
  }

  e.preventDefault();

  if (this.errors.length) {
    return;
  }

  isLoading.value = true;

  const response = await resetPassword(this.httpClient)(this.token, this.newPassword);

  if (isOk(response)) {
    toast.success(`Your password has been reset.`);
    router.push({ name: 'home' });
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
    toast.error(`There was a problem resetting your password, please try again.`);
  }

  isLoading.value = false;
}
</script>

<style scoped></style>
