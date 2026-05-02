<template>
  <view-container :is-auth-page="true">
    <view-title :title="guild ? guildFullName : 'Guild'" />

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && guild" class="mb-4">
      <guild-achievements :achievements="guild.achievements || []" />

      <p class="float-end">Total Rank Points: <span class="text-warning">{{guild.totalRank}}</span></p>

      <h5 class="mb-0">Guild Roster</h5>

      <p class="mb-2"><small class="text-warning">Total Members: {{1 + (guild.officers?.length || 0) + (guild.members?.length || 0)}}</small></p>

      <guild-member-list :guild="guild">
        <template v-slot:default="{ value, getColumnClass }">
          <tr>
            <td>
                <router-link :to="{ name: 'account-achievements', params: { userId: value._id }}">{{value.username}}</router-link>
            </td>
            <td :class="getRoleClass(value.role, getColumnClass)">{{getRoleName(value.role)}}</td>
            <td align="right" :class="getColumnClass('rank')">{{value.achievements.rank}}</td>
            <td align="right" :class="getColumnClass('victories')">{{value.achievements.victories}}</td>
            <td align="right" :class="getColumnClass('renown')">{{value.achievements.renown}}</td>
          </tr>
        </template>
      </guild-member-list>
    </div>
  </view-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, inject } from 'vue';
import ViewContainer from '../components/ViewContainer.vue';
import ViewTitle from '../components/ViewTitle.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import GuildMemberList from './components/MemberList.vue';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { useRoute } from 'vue-router';
import {detailGuild} from "@/services/typedapi/guild";
import type {GuildWithUsers} from "@solaris/common";
import GuildAchievements from './components/Achievements.vue';

type SortingKey = 'rank' | 'victories' | 'renown' | 'role';

const httpClient = inject(httpInjectionKey)!;

const route = useRoute();

const guild = ref<GuildWithUsers<string> | null>(null);
const isLoading = ref(false);

const guildFullName = computed(() => `${guild.value?.name} [${guild.value?.tag}]`);

const loadGuild = async (guildId: string) => {
  isLoading.value = true;

  const response = await detailGuild(httpClient)(guildId);
  if (isOk(response)) {
    guild.value = response.data;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

watch(() => route.params.guildId, (newVal) => {
  if (newVal) {
    loadGuild(newVal.toString());
  }
});

const getRoleName = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getRoleClass = (role: string, getColumnClass: (col: SortingKey) => Record<string, boolean>) => {
  return {
    'text-warning': role === 'leader',
    'text-info': role === 'officer',
    'text-danger': role === 'invitee',
    ...getColumnClass('role')
  }
};

onMounted(async () => {
  const guildId = route.params.guildId.toString();
  await loadGuild(guildId);
});
</script>
<style scoped>

</style>
