<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2" v-if="!isLoading">
        <input id="email" ref="email" type="text" required="required" class="form-control" placeholder="Email" v-model="email" :disabled="isLoading"/>
    </div>

    <div class="mb-2" v-if="!isLoading">
        <input id="password" ref="password" type="password" required="required" class="form-control" placeholder="Password" v-model="password"  :disabled="isLoading"/>
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
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import router from '../../../router'
import FormErrorList from '../../components/FormErrorList.vue';
import authService from '../../../services/api/auth';
import {userClientSocketEmitterInjectionKey} from "@/sockets/socketEmitters/user";
import {inject, ref, type Ref} from 'vue';
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';

const userClientSocketEmitter = inject(userClientSocketEmitterInjectionKey)!;

const store: Store<State> = useStore();

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

  try {
    isLoading.value = true;

    const emailAddress = email.value;

    // Call the login API endpoint
    const response = await authService.login(emailAddress, password.value);

    if (response.status === 200) {
      store.commit('setUserId', response.data._id)
      store.commit('setUsername', response.data.username)
      store.commit('setRoles', response.data.roles)
      store.commit('setUserCredits', response.data.credits)

      userClientSocketEmitter.emitJoined();

      router.push({name: 'main-menu'})
    }
  } catch (err: any) {
    errors.value = err.response.data.errors || [];
  }

  isLoading.value = false
}
</script>

<style scoped>
</style>
