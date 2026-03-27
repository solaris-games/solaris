<template>
  <tr>
    <td>
      <router-link :to="{ name: 'guild-details', params: { guildId: invite._id }}">
        <span>{{invite.name}} [{{invite.tag}}]</span>
      </router-link>
    </td>
    <td class="text-end">
      <button class="btn btn-sm btn-success ms-1" :disabled="isLoading" @click="accept()" title="Accept invitation">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn btn-sm btn-danger ms-1" :disabled="isLoading" @click="reject()" title="Reject invitation">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import type {Guild} from "@solaris-common";
import {useStore} from "vuex";
import {useConfirm} from "@/hooks/confirm.ts";
import {acceptGuildInvite, declineGuildInvite} from "@/services/typedapi/guild";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const props = defineProps<{
  invite: Guild<string>,
}>();

const emit = defineEmits<{
  onInvitationAccepted: [inviteId: string],
  onInvitationDeclined: [inviteId: string],
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const confirm = useConfirm();

const isLoading = ref(false);

const accept = async () => {
  if (!await confirm('Accept invitation', `Are you sure you want to accept the invitation from ${props.invite.name}[${props.invite.tag}]?`)) {
    return;
  }

  isLoading.value = true;

  const response = await acceptGuildInvite(httpClient)(props.invite._id);
  if (isOk(response)) {
    emit('onInvitationAccepted', props.invite._id);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const reject = async () => {
  if (!await confirm('Decline invitation', `Are you sure you want to decline the invitation from ${props.invite.name}[${props.invite.tag}]?`)) {
    return;
  }

  isLoading.value = true;

  const response = await declineGuildInvite(httpClient)(props.invite._id);
  if (isOk(response)) {
    emit('onInvitationDeclined', props.invite._id);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};
</script>

<style scoped>

</style>
