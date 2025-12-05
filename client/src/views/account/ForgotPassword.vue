<template>
  <view-container :is-auth-page="false">
    <view-title title="Forgot Password" navigation="home" />

    <form-error-list v-bind:errors="errors" />

    <form @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="email">Email Address</label>
        <input type="email" :required="false" class="form-control" name="email" v-model="email" :disabled="isLoading">
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

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import { inject, ref } from 'vue'
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi'
import {requestPasswordReset} from "@/services/typedapi/user";
import {toastInjectionKey} from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const isLoading = ref(false);
const errors = ref<string[]>([]);
const email = ref('');

const handleSubmit = async (e: Event) => {
  errors.value = [];

  if (!email.value) {
    errors.value.push('Email required.')
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  const response = await requestPasswordReset(httpClient)(email.value);

  if (isOk(response)) {
    toast.success(`A password reset email has been sent to the email address, please check your email inbox.`);
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
    toast.error(`There was a problem resetting your password, please check that you entered your email address correctly.`);
  }

  router.push({ name: 'home' });

  isLoading.value = false;
}
</script>

<style scoped></style>
