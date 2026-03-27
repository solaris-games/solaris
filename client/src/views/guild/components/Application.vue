<template>
  <tr>
    <td>
      <router-link :to="{ name: 'guild-details', params: { guildId: application._id }}">
        <span>{{application.name}} [{{application.tag}}]</span>
      </router-link>
    </td>
    <td class="text-end">
      <button class="btn btn-sm btn-outline-success ms-1" v-if="!application.hasApplied" :disabled="isLoading" @click="apply()" title="Send application">
        <i class="fas fa-paper-plane"></i> Apply
      </button>
      <button class="btn btn-sm btn-danger ms-1" v-if="application.hasApplied" :disabled="isLoading" @click="withdraw()" title="Withdraw application">
        <i class="fas fa-trash"></i> Withdraw
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import type {Guild, GuildApplication} from "@solaris-common";
import {useConfirm} from "@/hooks/confirm.ts";
import {applyToGuild, withdrawGuildApplication} from "@/services/typedapi/guild";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const props = defineProps<{
  application: GuildApplication<string>,
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const confirm = useConfirm();

const isLoading = ref(false);

const apply = async () => {
  if (!await confirm('Apply to Join', `Are you sure you want to apply to become a member of ${props.application.name}[${props.application.tag}]?`)) {
    return;
  }

  isLoading.value = true;

  const response = await applyToGuild(httpClient)(props.application._id);
  if (isOk(response)) {
    props.application.hasApplied = true;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const withdraw = async () => {
  if (!await confirm('Withdraw Application', `Are you sure you want to withdraw the application to ${props.application.name}[${props.application.tag}]?`)) {
    return;
  }

  isLoading.value = true;

  const response = await withdrawGuildApplication(httpClient)(props.application._id);
  if (isOk(response)) {
    props.application.hasApplied = false;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};
</script>

<style scoped>

</style>
