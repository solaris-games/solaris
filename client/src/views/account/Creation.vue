<template>
  <div class="full-container">
    <view-container :hideTopBar="true" :is-auth-page="false">
      <view-title title="Create Account" navigation="home" />

      <div class="row">
        <div class="col-sm-12 col-md-6">
          <h4>Sign up to play <span class="text-warning">Solaris</span>!</h4>
          <p>Discover a space strategy game filled with conquest, betrayal and subterfuge.</p>
          <p>Build alliances, make enemies and fight your way to victory to <span class="text-danger">galactic
              domination.</span>
          </p>
          <p><span class="text-info">Research and improve technologies</span> to gain an edge over your opponents. Trade
            with allies and build up huge fleets of ships.</p>
          <p>Will you conquer the galaxy?</p>
          <hr />
          <p>You can play <span class="text-warning">Solaris</span> on any of the following platforms:</p>
          <p>
            <a href="https://solaris.games" target="_blank" title="Web" class="me-2">
              <i class="fab fa-chrome"></i> Web
            </a>
            <a href="https://store.steampowered.com/app/1623930/Solaris/" target="_blank" title="Steam" class="me-2">
              <i class="fab fa-steam"></i> Steam
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.voxel.solaris_android" target="_blank"
              title="Android">
              <i class="fab fa-google-play"></i> Android
            </a>
          </p>
        </div>
        <div class="col-sm-12 col-md-6">
          <form-error-list v-bind:errors="errors" />

          <form @submit="handleSubmit">
            <div class="mb-2">
              <label for="email">Email Address</label>
              <input type="email" :required="true" class="form-control" name="email" v-model="email"
                :disabled="isLoading">
            </div>

            <div class="mb-2">
              <label for="username">Username</label>
              <input type="text" :required="true" class="form-control" name="username" minlength="3" maxlength="24"
                v-model="username" :disabled="isLoading">
            </div>

            <div class="mb-2">
              <label for="password">Password</label>
              <input type="password" :required="true" class="form-control" name="password" v-model="password"
                :disabled="isLoading">
            </div>

            <div class="mb-2">
              <label for="passwordConfirm">Re-enter Password</label>
              <input type="password" :required="true" class="form-control" name="passwordConfirm"
                v-model="passwordConfirm" :disabled="isLoading">
            </div>

            <div class="checkbox mb-2">
              <input id="privacyPolicy" type="checkbox" :required="true" name="privacyPolicy"
                v-model="privacyPolicyAccepted" :disabled="isLoading" class="me-2">
              <label for="privacyPolicy">Accept
                <router-link :to="{ name: 'privacy-policy' }" class="me-2" title="Privacy Policy">
                  Privacy Policy
                </router-link>
              </label>
            </div>

            <div class="mb-2">
              <div class="row">
                <div class="col-6">
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-success" :disabled="isLoading">
                      <i class="fas fa-sign-in-alt"></i>
                      Register
                    </button>
                  </div>
                </div>
                <div class="col-6">
                  <div class="d-grid gap-2">
                    <router-link to="/" tag="button" class="btn btn-outline-danger">Cancel</router-link>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <loading-spinner :loading="isLoading" />
        </div>
      </div>
    </view-container>
    <parallax />
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import Parallax from '../components/Parallax.vue'
import { inject, ref } from 'vue';
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { createUser } from '@/services/typedapi/user';
import {toastInjectionKey} from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const isLoading = ref(false);
const errors = ref<string[]>([]);
const email = ref('');
const username = ref('');
const password = ref('');
const passwordConfirm = ref('');
const privacyPolicyAccepted = ref(false);

const handleSubmit = async (e: Event) => {
  errors.value = [];

  if (!email.value) {
    errors.value.push('Email required.');
  }

  if (!username.value) {
    errors.value.push('Username required.');
  }

  if (!password.value) {
    errors.value.push('Password required.');
  }

  if (!passwordConfirm.value) {
    errors.value.push('Password confirmation required.');
  }

  if (password.value !== passwordConfirm.value) {
    errors.value.push('Passwords must match.');
  }

  if (!privacyPolicyAccepted.value) {
    errors.value.push('Privacy policy must be accepted.');
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  // Call the account create API endpoint
  const response = await createUser(httpClient)(email.value, username.value, password.value);

  if (isOk(response)) {
    toast.success(`Welcome ${username.value}! You can now log in and play Solaris.`);

    router.push({ name: 'home' });
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isLoading.value = false;
}
</script>

<style scoped>
img {
  object-fit: cover;
}

.full-container {
  background-color: black !important;
}
</style>
