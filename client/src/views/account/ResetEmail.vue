<template>
  <view-container :is-auth-page="false">
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

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import { inject, ref } from 'vue'
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi'
import { updateEmailAddress } from '@/services/typedapi/user'
import {toastInjectionKey} from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const isLoading = ref(false);
const errors = ref<string[]>([]);
const email = ref('');

const handleSubmit = (e) => {
  errors.value = [];

  if (!email.value) {
    errors.value.push('Email address required.')
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  const response = await updateEmailAddress(httpClient)(email.value);

  if (isOk(response)) {
    toast.success(`Email address updated.`);
    router.push({ name: 'account-settings' });
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
    toast.error(`There was a problem updating your email address, please try again.`);
  }

  isLoading.value = false;
}
</script>

<style scoped></style>
