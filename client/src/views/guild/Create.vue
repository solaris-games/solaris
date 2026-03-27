<template>
  <view-container :is-auth-page="true">
    <view-title title="Create Guild" />

    <loading-spinner :loading="isLoading"/>

    <h4>Found a new guild</h4>

    <ul>
      <li>Become the <strong>leader</strong> of a prestigious guild.</li>
      <li>Invite your friends and allies to join you.</li>
      <li>Show off your guild tag in games.</li>
      <li>Assign roles to <strong>Members</strong>, promote players to <strong class="text-info">Officers</strong>.</li>
      <li>Arrange <strong class="text-warning">Guild vs. Guild</strong> matches to see which guild is best.</li>
    </ul>

    <form @submit="handleSubmit">
      <div class="mb-2">
        <label for="name">Guild Name</label>
        <input type="text" :required="true" class="form-control" minlength="4" maxlength="64" name="name" v-model="name" :disabled="isLoading"
          @change="onGuildNameChanged">
      </div>

      <div class="mb-2">
        <label for="tag">Guild Tag</label>
        <input type="text" :required="true" class="form-control" minlength="2" maxlength="4" name="tag" v-model="tag" :disabled="isLoading">
      </div>

      <form-error-list :errors="errors"/>

      <p><span class="text-warning">Warning</span>: Founding a guild costs <strong class="text-danger">3 Galactic Credits</strong>. <router-link :to="{ name: 'galactic-credits-shop'}"><i class="fas fa-shopping-basket"></i> Purchase Galactic Credits</router-link> or earn credits by winning official games.</p>

      <div class="mb-2">
        <div class="row">
          <div class="col">
            <router-link to="/guild" tag="button" class="btn btn-danger">
              <i class="fas fa-arrow-left"></i>
              Cancel
            </router-link>
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-success" :disabled="isLoading">
              <i class="fas fa-shield-alt"></i>
              Found Guild
            </button>
          </div>
        </div>
      </div>
    </form>
  </view-container>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { useStore } from 'vuex';
import router from '../../router';
import ViewContainer from '../components/ViewContainer.vue';
import ViewTitle from '../components/ViewTitle.vue';
import FormErrorList from '../components/FormErrorList.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {useConfirm} from "@/hooks/confirm.ts";
import {createGuild} from "@/services/typedapi/guild";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const confirm = useConfirm();

const isLoading = ref(false);
const errors = ref<string[]>([]);
const name = ref('');
const tag = ref('');

const onGuildNameChanged = () => {
  name.value = name.value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();});
};

const handleSubmit = async (e: Event) => {
  errors.value = [];

  if (!name.value) {
    errors.value.push('Name is required.')
  }

  if (!tag.value) {
    errors.value.push('Tag is required.')
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  if (!await confirm('Found guild', `Are you sure you want to found a guild? It will cost 3 galactic credits.`)) {
    return;
  }

  isLoading.value = true;

  const response = await createGuild(httpClient)(name.value, tag.value);
  if (isOk(response)) {
    toast.success(`You have founded the guild ${name.value} [${tag.value}]!`);
    router.push({ name: 'guild' });
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }
}
</script>

<style scoped>

</style>
