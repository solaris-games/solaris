<template>
  <view-container :is-auth-page="true">
    <view-title :title="props.title" />

    <nav>
      <ul class="nav nav-tabs" role="tablist">
        <li role="presentation" class="nav-item" :class="name === 'announcements' ? 'active' : null" v-if="isAdministrator">
          <router-link class="nav-link" :class="name === 'announcements' ? 'active' : null" :to="{ path: '/administration/announcements' }">Announcements</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'games' ? 'active' : null">
          <router-link class="nav-link" :class="name === 'games' ? 'active' : null" :to="{ path: '/administration/games' }">Games</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'users' ? 'active' : null" v-if="isCommunityManager">
          <router-link class="nav-link" :class="name === 'users' ? 'active' : null" :to="{ path: '/administration/users' }">Users</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'passwordresets' ? 'active' : null" v-if="isAdministrator">
          <router-link class="nav-link" :class="name === 'passwordresets' ? 'active' : null" :to="{ path: '/administration/passwordResets' }">Password Resets</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'reports' ? 'active' : null" v-if="isCommunityManager">
          <router-link class="nav-link" :class="name === 'reports' ? 'active' : null" :to="{ path: '/administration/reports' }">Reports</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'insights' ? 'active' : null" v-if="isAdministrator">
          <router-link class="nav-link" :class="name === 'insights' ? 'active' : null" :to="{ path: '/administration/insights' }">Insights</router-link>
        </li>
      </ul>
    </nav>

    <slot />
  </view-container>
</template>

<script setup lang="ts">
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import { computed } from 'vue';
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';

const store: Store<State> = useStore();

const props = defineProps<{
  name: string,
  title: string
}>();

const name = computed(() => props.name);

const isAdministrator = computed(() => store.state.roles.administrator);
const isCommunityManager = computed(() => isAdministrator.value || store.state.roles.communityManager);
</script>

<style scoped>
</style>
