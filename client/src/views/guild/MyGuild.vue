<template>
  <view-container :is-auth-page="true">
    <view-title :title="guild ? guildFullName : 'Guilds'" />

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && guild" class="mb-4">
      <p class="float-end">Total Rank Points: <span class="text-warning">{{guild.totalRank}}</span></p>

      <h5 class="mb-0">Guild Roster</h5>

      <p class="mb-2"><small class="text-warning">Total Members: {{1 + (guild.officers?.length || 0) + (guild.members?.length || 0)}}</small></p>

      <guild-member-list :guild="guild">
        <template v-slot:default="{ value, getColumnClass }">
          <guild-member :guild="guild" :user="value" :role="value.role" :getColumnClass="getColumnClass"
            @onUserPromoted="onUpdate"
            @onUserDemoted="onUpdate"
            @onUserKicked="onUpdate"
            @onUserUninvited="onUpdate"
            @onUserApplicationAccepted="onUpdate"
            @onUserApplicationRejected="onUpdate"></guild-member>
        </template>
      </guild-member-list>

      <guild-new-invite v-if="isLeader || isOfficer"
        :guildId="guild._id"
        @onUserInvited="onUpdate"/>

      <router-link to="/guild/rename" class="btn btn-sm btn-primary mt-2" v-if="isLeader">
        <i class="fas fa-pencil-alt"></i> Rename Guild
      </router-link>
    </div>

    <div v-if="!isLoading && !guild" class="mb-4">
      <p>You are not a member of a guild. Accept an invitation, apply to join or found a new guild.</p>

      <div class="text-center">
        <router-link to="/guild/create" class="btn btn-lg btn-success">
          <i class="fas fa-shield-alt"></i> Create a Guild
        </router-link>
      </div>

      <h4 class="mt-4">Guild Invites</h4>

      <p v-if="!invites.length" class="text-warning">You have no guild invitations.</p>

      <div class="table-responsive" v-if="invites.length">
          <table class="table table-striped table-hover">
              <tbody>
                <guild-invite v-for="invite in invites" :key="invite._id"
                  :invite="invite"
                  @onInvitationAccepted="onUpdate"
                  @onInvitationDeclined="onUpdate"/>
              </tbody>
          </table>
      </div>

      <hr />

      <h4 class="mt-4">Guild Applications</h4>

      <p v-if="!applications.length" class="text-warning">You have not applied to become a member of a guild.</p>

      <div class="table-responsive" v-if="applications.length">
          <table class="table table-striped table-hover">
              <tbody>
                <guild-application v-for="application in applications" :key="application._id"
                  :application="application"/>
              </tbody>
          </table>
      </div>
    </div>
  </view-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue';
import ViewContainer from '../components/ViewContainer.vue';
import ViewTitle from '../components/ViewTitle.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import GuildNewInvite from './components/NewInvite.vue';
import GuildInvite from './components/Invite.vue';
import GuildApplication from './components/Application.vue';
import GuildMember from './components/Member.vue'
import GuildMemberList from './components/MemberList.vue'
import type {Guild, GuildWithUsers, GuildApplication as GuildApplicationData} from "@solaris/common";
import {detailMyGuild, listMyGuildApplications, listMyGuildInvites} from "@/services/typedapi/guild";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { useUserStore } from '@/stores/user';

const httpClient = inject(httpInjectionKey)!;

const userStore = useUserStore();

const isLoading = ref(false);
const guild = ref<GuildWithUsers<string> | null>(null);
const invites = ref<Guild<string>[]>([]);
const applications = ref<GuildApplicationData<string>[]>([]);

const guildFullName = computed(() => `${guild.value!.name} [${guild.value!.tag}]`);

const isLeader = computed(() => {
  return guild.value!.leader != null && guild.value!.leader._id === userStore.userId;
});

const isOfficer = computed(() => {
  return guild.value!.officers?.find(x => x._id === userStore.userId) != null;
});

const loadGuild = async () => {
  isLoading.value = true;
  guild.value = null;

  const response = await detailMyGuild(httpClient)();
  if (isOk(response)) {
    guild.value = response.data;
  } else {
    console.error(formatError(response));

    const invitesResponse = await listMyGuildInvites(httpClient)();
    if (isOk(invitesResponse)) {
      invites.value = invitesResponse.data;
    } else {
      console.error(formatError(invitesResponse));
    }

    const applicationsResponse = await listMyGuildApplications(httpClient)();
    if (isOk(applicationsResponse)) {
      applications.value = applicationsResponse.data;
    } else {
      console.error(formatError(applicationsResponse));
    }
  }

  isLoading.value = false;
};

const onUpdate = () => {
  loadGuild();
};

onMounted(() => {
  loadGuild();
});
</script>

<style scoped>
</style>
