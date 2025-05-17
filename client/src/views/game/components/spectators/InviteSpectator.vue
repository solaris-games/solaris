<template>
  <div>
    <loading-spinner :loading="isLoading"/>

    <h5>Invite Spectator</h5>

    <form-error-list :errors="errors"/>

    <form @submit="handleSubmit">
        <div class="row g-0">
            <div class="col">
                <textarea :required="true" class="form-control" name="usernames" v-model="usernames" :disabled="isLoading" placeholder="Enter usernames here...">

                </textarea>
            </div>
            <div class="col-auto ms-2">
                <button type="submit" class="btn btn-success" :disabled="isLoading">
                    <i class="fas fa-user-plus"></i>
                    Invite
                </button>
            </div>
        </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import FormErrorList from '../../../components/FormErrorList.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import { ref, inject, type Ref } from 'vue';
import {makeConfirm} from "@/util/confirm";
import { useStore, type Store } from 'vuex';
import type { State } from '@/store';
import {toastInjectionKey} from "@/util/keys";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {inviteSpectators} from "@/services/typedapi/spectator";

const store: Store<State> = useStore();
const confirm = makeConfirm(store);
const toast = inject(toastInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const emit = defineEmits<{
  (e: 'onSpectatorsInvited'): void
}>();

const isLoading = ref(false);
const usernames = ref('');
const errors: Ref<string[] | null> = ref(null);

const handleSubmit = async e => {
  errors.value = [];

  if (!usernames.value) {
    errors.value.push('Usernames are required.');
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  const actualUsernames = usernames.value.split(',').map(username => username.trim()).filter(username => username.length > 0);
  const usernamesText = actualUsernames.join(", ");

  if (!(await confirm('Invite Spectator', `Are you sure you want to invite ${usernamesText} to spectate? They will be able to view the galaxy from your perspective.`))) {
    return;
  }

  isLoading.value = true;

  const response = await inviteSpectators(httpClient)(store.state.game._id, actualUsernames);

  if (isOk(response)) {
    toast.success(`You invited ${usernamesText} to spectate you in this game.`);

    emit('onSpectatorsInvited');

    usernames.value = '';
  } else {
    console.log(formatError(response));
    errors.value = extractErrors(response)
  }

  isLoading.value = false;
}
</script>

<style scoped>

</style>
