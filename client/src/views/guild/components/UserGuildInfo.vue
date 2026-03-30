<template>
  <div>
    <loading-spinner :loading="isLoadingGuild"/>

    <div class="row bg-dark mb-2 pt-2 pb-2" v-if="!isLoadingGuild && user">
      <div class="col">
        <h5 class="mb-0 pt-2 pb-2">
          <span>Guild: </span>
          <span v-if="!user.guild && !isUserInvited" class="text-warning">None</span>
          <span v-if="!user.guild && isUserInvited">Invited to </span>
          <router-link v-if="user.guild" :to="{ name: 'guild-details', params: { guildId: user.guild._id }}">
            <span>{{ user.guild.name }} [{{ user.guild.tag }}]</span>
          </router-link>
          <router-link v-if="myGuild && isUserInvited" :to="{ name: 'guild-details', params: { guildId: myGuild._id }}">
            <span>{{ myGuild.name }} [{{ myGuild.tag }}]</span>
          </router-link>
        </h5>
      </div>
      <div class="col-auto" v-if="!user.guild && myGuild && ownUserCanInvite && !isUserInvited">
        <button class="btn btn-success" @click="inviteUser" :disabled="isInvitingUser">
          <i class="fas fa-user-plus"></i>
          Invite to Guild
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, inject} from "vue";
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import type {AchievementsUser, GuildWithUsers} from "@solaris-common";
import {detailMyGuild, inviteGuild} from "@/services/typedapi/guild";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {useConfirm} from "@/hooks/confirm";
import {toastInjectionKey} from "@/util/keys";
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  user: AchievementsUser<string>,
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const userStore = useUserStore();
const confirm = useConfirm();

const isLoadingGuild = ref(false);
const isInvitingUser = ref(false);
const myGuild = ref<GuildWithUsers<string> | null>(null);

const isUserInvited = computed(() => {
  return myGuild.value && myGuild.value.invitees?.find(inv => inv._id === props.user._id);
});

const ownUserCanInvite = computed(() => {
  return myGuild.value &&
      (myGuild.value.leader?._id === userStore.userId || myGuild.value.officers?.find(x => x._id === userStore.userId));
});

const loadMyGuild = async () => {
  isLoadingGuild.value = true;

  const response = await detailMyGuild(httpClient)();
  if (isOk(response)) {
    myGuild.value = response.data;
  } else {
    console.error(formatError(response));
  }

  isLoadingGuild.value = false;
};

const inviteUser = async () => {
  const confirmed = await confirm(`Invite to guild`, `Are you sure you want to invite ${props.user.username} to join your guild?`);
  if (!confirmed) {
    return;
  }

  isInvitingUser.value = true;

  const response = await inviteGuild(httpClient)(myGuild.value!._id, props.user.username);
  if (isOk(response)) {
    toast.success(`You invited ${props.user.username} to your guild.`);
    await loadMyGuild();
  } else {
    console.error(formatError(response));
  }

  isInvitingUser.value = false;
};

onMounted(() => {
  loadMyGuild();
});
</script>

<style scoped>

</style>
