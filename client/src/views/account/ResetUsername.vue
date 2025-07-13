<template>
  <view-container :isAuthPage="false">
    <view-title title="Reset Username" />

    <form @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="username">New Username</label>
        <input type="text" :required="true" class="form-control" minlength="3" maxlength="24" v-model="username"
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

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi'
import { updateUsername } from '@/services/typedapi/user'
import { ref, inject } from 'vue';
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import {toastInjectionKey} from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const isLoading = ref(false);
const errors = ref<string[]>([]);
const username = ref<string>('');

const handleSubmit = async (e) => {
  errors.value = []

  if (!username.value) {
    errors.value.push('Username required.')
  }

  e.preventDefault()

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  const response = await updateUsername(httpClient)(username.value);

  if (isOk(response)) {store.commit('setUsername', username.value);
    toast.success(`Username updated.`)
    router.push({ name: 'account-settings' })
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
    toast.error(`There was a problem updating your username, please try again.`);
  }

  isLoading.value = false;
}
</script>

<style scoped></style>
