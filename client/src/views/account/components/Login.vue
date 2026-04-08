<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2" v-if="!isLoading">
        <input id="email" type="text" required class="form-control" placeholder="Email" v-model="email" :disabled="isLoading"/>
    </div>

    <div class="mb-2" v-if="!isLoading">
        <input id="password" type="password" required class="form-control" placeholder="Password" v-model="password"  :disabled="isLoading"/>
    </div>

    <loading-spinner :loading="isLoading"/>

    <form-error-list v-bind:errors="errors"/>

    <div class="mb-2">
      <div class="row">
        <div class="col-6">
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-success" :disabled="isLoading">
              Login
              <i class="fas fa-sign-in-alt"></i>
            </button>
          </div>
        </div>
        <div class="col-6">
          <div class="d-grid gap-2">
            <router-link to="/account/create" tag="button" class="btn btn-primary" :disabled="isLoading">
              Register
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-2">
      Forgot <router-link to="/account/forgot-password">Password</router-link>/<router-link to="/account/forgot-username">Username</router-link>?
    </div>
  </form>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import router from '../../../router';
import FormErrorList from '../../components/FormErrorList.vue';
import {userClientSocketEmitterInjectionKey} from "@/sockets/socketEmitters/user";
import {inject, ref, type Ref} from 'vue';
import {login} from "@/services/typedapi/auth";
import {extractErrors, httpInjectionKey, isOk} from "@/services/typedapi";
import { useUserStore } from '@/stores/user';

const userClientSocketEmitter = inject(userClientSocketEmitterInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const userStore = useUserStore();

const isLoading = ref(false);
const errors: Ref<string[]> = ref([]);
const email = ref<string>('');
const password = ref<string>('');

const handleSubmit = async (e: Event) => {
  errors.value = [];

  if (!email.value) {
    errors.value.push('Email required.');
  }

  if (!password) {
    errors.value.push('Password required.');
  }

  e && e.preventDefault();

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  const emailAddress = email.value;

  const response = await login(httpClient)(emailAddress, password.value);
  if (isOk(response)) {
    userStore.setUserId(response.data._id)
    userStore.setUsername(response.data.username)
    userStore.setRoles(response.data.roles)
    userStore.setCredits(response.data.credits)

    userClientSocketEmitter.emitJoined();

    router.push({name: 'main-menu'})
  } else {
    errors.value = extractErrors(response);
  }

  isLoading.value = false
}
</script>

<style scoped>
</style>
