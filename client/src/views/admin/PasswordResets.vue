
<template>
  <administration-page title="Recent Password Resets" name="passwordresets">
    <loading-spinner :loading="!passwordResets"/>

    <div v-if="passwordResets">
      <table class="mt-2 table table-sm table-striped table-responsive">
        <thead class="table-dark">
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user of passwordResets" :key="user._id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <a v-if="user.resetPasswordToken"
               :href="'#/account/reset-password-external?token=' + user.resetPasswordToken">Reset Link</a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </administration-page>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, type Ref } from "vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AdministrationPage from "./AdministrationPage.vue";
import type { ListPasswordReset } from "@solaris-common";
import { formatError, httpInjectionKey, isOk } from "@/services/typedapi";
import { getPasswordResets } from "@/services/typedapi/admin";
import { toastInjectionKey } from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const passwordResets: Ref<ListPasswordReset<string>[] | null> = ref(null);

const loadPasswordResets = async () => {
  const response = await getPasswordResets(httpClient)();

  if (isOk(response)) {
    passwordResets.value = response.data;
  } else {
    console.error(formatError(response));
    toast.error("Error loading password resets");
  }
}

onMounted(async () => await loadPasswordResets());
</script>

<style scoped>

</style>
