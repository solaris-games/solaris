<template>
  <tr>
    <td>
        <router-link :to="{ name: 'account-achievements', params: { userId: user._id }}">{{user.username}}</router-link>
    </td>
    <td :class="{
      'text-warning': userIsLeader,
      'text-info': userIsOfficer,
      'text-danger': userIsInvitee,
      'text-success': userIsApplicant,
      ...getColumnClass('role')
    }">{{roleName}}</td>
    <td align="right" :class="getColumnClass('rank')">
      {{user.achievements.rank}}
      <img class="user-level-icon" :src="levelSrc">
    </td>
    <td align="right" :class="getColumnClass('victories')">{{user.achievements.victories}}</td>
    <td align="right" :class="getColumnClass('renown')">{{user.achievements.renown}}</td>
    <td class="text-end">
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="disband()" v-if="isCurrentUser && userIsLeader" title="Disband the guild">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="leave()" v-if="isCurrentUser && !userIsLeader" title="Leave the guild">
        <i class="fas fa-sign-out-alt"></i>
      </button>
      <button class="btn btn-sm btn-outline-success ms-1" :disabled="isLoading" @click="promote()" v-if="canPromote" title="Promote this user">
        <i class="fas fa-level-up-alt"></i>
      </button>
      <button class="btn btn-sm btn-outline-warning ms-1" :disabled="isLoading" @click="demote()" v-if="canDemote" title="Demote this user">
        <i class="fas fa-level-down-alt"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="kick()" v-if="canKick" title="Kick this user from the guild">
        <i class="fas fa-ban"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="uninvite()" v-if="canRevokeInvite" title="Revoke invitation">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm btn-outline-success ms-1" :disabled="isLoading" @click="accept()" v-if="canRevokeApplication" title="Accept application">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="reject()" v-if="canRevokeApplication" title="Reject application">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import router from '../../../router';
import type {GuildWithUsers} from "@solaris/common";
import type {GuildRole, GuildUser} from "@/views/guild/components/MemberList.vue";
import {useConfirm} from "@/hooks/confirm.ts";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {
  acceptGuildInviteForApplicant, deleteGuild,
  demoteGuildMember,
  kickGuildMember, leaveGuild,
  promoteGuildMember, rejectGuildApplication,
  uninviteGuild
} from "@/services/typedapi/guild";
import { useUserStore } from '@/stores/user';

type SortingKey = 'role' | 'rank' | 'victories' | 'renown';

const props = defineProps<{
  guild: GuildWithUsers<string>,
  role: GuildRole,
  user: GuildUser<string>,
  getColumnClass: (col: SortingKey) => Record<SortingKey, boolean>,
}>();

const emit = defineEmits<{
  onUserPromoted: [userId: string],
  onUserDemoted: [userId: string],
  onUserKicked: [userId: string],
  onUserUninvited: [userId: string],
  onUserApplicationAccepted: [userId: string],
  onUserApplicationRejected: [userId: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const userStore = useUserStore();
const confirm = useConfirm();

const isLoading = ref(false);

const levelSrc = computed(() => new URL(`../../../assets/levels/${props.user.achievements.level}.png`, import.meta.url).href);

const roleName = computed(() => props.role.charAt(0).toUpperCase() + props.role.slice(1));

const isCurrentUser = computed(() => props.user._id === userStore.userId);

const currentUserIsLeader = computed(() => props.guild.leader != null && props.guild.leader._id === userStore.userId);

const currentUserIsOfficer = computed(() => props.guild.officers?.find(x => x._id === userStore.userId) != null);

const userIsLeader = computed(() => props.guild.leader != null && props.guild.leader._id === props.user._id);

const userIsOfficer = computed(() => props.guild.officers?.find(x => x._id === props.user._id) != null);

const userIsMember = computed(() => props.guild.members?.find(x => x._id === props.user._id) != null);

const userIsInvitee = computed(() => props.guild.invitees?.find(x => x._id === props.user._id) != null);

const userIsApplicant = computed(() => props.guild.applicants?.find(x => x._id === props.user._id) != null);

const canPromote = computed(() => {
  if (userIsOfficer.value) {
    return currentUserIsLeader.value;
  } else if (userIsMember.value) {
    return currentUserIsLeader.value || currentUserIsOfficer.value;
  } else {
    return false;
  }
});

const canDemote = computed(() => {
  if (userIsOfficer.value) {
    return currentUserIsLeader.value;
  } else {
    return false;
  }
});

const canKick = computed(() => {
  if (userIsOfficer.value) {
    return currentUserIsLeader.value;
  } else if (userIsMember.value) {
    return currentUserIsLeader.value || currentUserIsOfficer.value;
  } else {
    return false;
  }
});

const canRevokeInvite = computed(() => {
  if (userIsInvitee.value) {
    return currentUserIsLeader.value || currentUserIsOfficer.value;
  } else {
    return false;
  }
});

const canRevokeApplication = computed(() => {
  if (userIsApplicant.value) {
    return currentUserIsLeader.value || currentUserIsOfficer.value;
  } else {
    return false;
  }
});

const promote = async () => {
  if (!await confirm('Promote user', `Are you sure you want to promote ${props.user.username}?`)) {
    return;
  }

  if (props.role === 'officer' && !await confirm('Promote to Guild Leader', `${props.user.username} will be promoted to the Guild Leader and you will be demoted to Officer, are you sure?`)) {
    return;
  }

  isLoading.value = true;

  const response = await promoteGuildMember(httpClient)(props.guild._id, props.user._id);
  if (isOk(response)) {
    emit('onUserPromoted', props.user._id);

    toast.default(`${props.user.username} promoted.`);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const demote = async () => {
  if (!await confirm('Demote user', `Are you sure you want to demote ${props.user.username}?`)) {
    return;
  }

  isLoading.value = true;

  const response = await demoteGuildMember(httpClient)(props.guild._id, props.user._id);
  if (isOk(response)) {
    emit('onUserDemoted', props.user._id);

    toast.default(`${props.user.username} demoted.`);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false
};

const kick = async () => {
  if (!await confirm('Kick user', `Are you sure you want to kick ${props.user.username}?`)) {
    return;
  }

  isLoading.value = true;

  const response = await kickGuildMember(httpClient)(props.guild._id, props.user._id);
  if (isOk(response)) {
    emit('onUserKicked', props.user._id);

    toast.default(`${props.user.username} kicked.`);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const uninvite = async () => {
  if (!await confirm('Uninvite user', `Are you sure you want to uninvite ${props.user.username}?`)) {
    return;
  }

  isLoading.value = true;

  const response = await uninviteGuild(httpClient)(props.guild._id, props.user._id);
  if (isOk(response)) {
    emit('onUserUninvited', props.user._id);

    toast.default(`${props.user.username} uninvited.`);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false
};

const accept = async () => {
  if (!await confirm('Accept Application', `Are you sure you want to accept the application from ${props.user.username}?`)) {
    return;
  }

  isLoading.value = true;

  const response = await acceptGuildInviteForApplicant(httpClient)(props.guild._id, props.user._id);
  if (isOk(response)) {
    emit('onUserApplicationAccepted', props.user._id);

    toast.default(`${props.user.username} application accepted.`);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const reject = async () => {
  if (!await confirm('Reject Application', `Are you sure you want to reject the application from ${props.user.username}?`)) {
    return;
  }

  isLoading.value = true;

  const response = await rejectGuildApplication(httpClient)(props.guild._id, props.user._id);
  if (isOk(response)) {
    emit('onUserApplicationRejected', props.user._id);

    toast.default(`${props.user.username} application rejected.`);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
}

const leave = async () => {
  if (!await confirm('Leave guild', `Are you sure you want to leave the guild?`)) {
    return;
  }

  isLoading.value = true;

  const response = await leaveGuild(httpClient)(props.guild._id);
  if (isOk(response)) {
    toast.default(`You have left ${props.guild.name}[${props.guild.tag}].`);

    router.push({name: 'main-menu'});
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const disband = async () => {
  if (!await confirm('Disband guild', `Are you sure you want to disband the guild?`)) {
    return;
  }

  if (!await confirm('Disband guild', `Are you absolutely sure you want to disband the guild? The guild will be deleted and all members kicked, this cannot be undone.`)) {
    return;
  }

  isLoading.value = true;

  const response = await deleteGuild(httpClient)(props.guild._id);
  if (isOk(response)) {
    toast.default(`You have disbanded ${props.guild.name}[${props.guild.tag}].`);
    router.push({ name: 'main-menu' });
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};
</script>

<style scoped>
.user-level-icon {
  height: 28px;
}
</style>
