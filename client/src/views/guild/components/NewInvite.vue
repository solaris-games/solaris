<template>
  <div>
    <loading-spinner :loading="isLoading" />

    <h5>Invite Player</h5>

    <form-error-list :errors="errors" />

    <form @submit="handleSubmit">
      <div class="row g-0">
        <div class="col">
          <input
            type="text"
            :required="true"
            class="form-control"
            name="username"
            v-model="username"
            :disabled="isLoading"
            placeholder="Enter Player Name..."
            minlength="3"
            maxlength="24"
          />
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
import { ref, inject } from "vue";
import FormErrorList from "../../components/FormErrorList.vue";
import LoadingSpinner from "../../components/LoadingSpinner.vue";
import { inviteGuild } from "@/services/typedapi/guild";
import {
  extractErrors,
  formatError,
  httpInjectionKey,
  isOk,
} from "@/services/typedapi";

import { useToast } from "vue-toast-notification";
const props = defineProps<{
  guildId: string;
}>();

const emit = defineEmits<{
  onUserInvited: [];
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = useToast();

const isLoading = ref(false);
const errors = ref<string[]>([]);
const username = ref("");

const handleSubmit = async (e: Event) => {
  errors.value = [];

  if (!username.value) {
    errors.value.push("Username is required.");
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  const response = await inviteGuild(httpClient)(props.guildId, username.value);
  if (isOk(response)) {
    toast.default(`You invited ${username.value} to the guild.`, {
      type: "success",
    });

    emit("onUserInvited");

    username.value = "";
  } else {
    console.log(formatError(response));
    errors.value = extractErrors(response);
  }

  isLoading.value = false;
};
</script>

<style scoped></style>
