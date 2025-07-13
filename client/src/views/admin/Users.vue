<template>
  <administration-page title="Recent Users" name="users">
    <loading-spinner :loading="!users"/>

    <div v-if="users">
      <user-panel v-for="user of users" :key="user.username" :user="user" :duplicate-i-ps="Boolean(getDuplicateIPs(user).length)"></user-panel>
    </div>
  </administration-page>
</template>

<script setup lang="ts">
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AdministrationPage from "./AdministrationPage.vue";
import { useRoute } from 'vue-router';
import { inject, onMounted, ref, computed, type Ref } from "vue";
import { formatError, httpInjectionKey, isOk } from "@/services/typedapi";
import { toastInjectionKey } from "@/util/keys";
import type { ListUser, AdminSpecificUserInfo } from "@solaris-common";
import { getUsers } from "@/services/typedapi/admin";
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import UserPanel from "@/views/admin/components/UserPanel.vue";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const route = useRoute();

const filterUser: Ref<string | undefined> = ref(undefined);
const filterType: Ref<string> = ref('_id');
const users: Ref<ListUser<string>[] | null> = ref(null);

const isAdministrator = computed(() => store.state.roles.administrator);

const getDuplicateIPs = (user: ListUser<string>) => {
  if (!users.value || !isAdministrator) {
    return [];
  }

  const userA = user as (ListUser<string> & AdminSpecificUserInfo);

  const otherUsers = users.value.filter(u => u._id !== userA._id) as (ListUser<string> & AdminSpecificUserInfo)[];

  return otherUsers.filter(oU => oU.lastSeenIP && oU.lastSeenIP === userA.lastSeenIP).map(x => x.username);
};

const reqGetUsers = async () => {
  const response = await getUsers(httpClient)();

  if (isOk(response)) {
    return response.data;
  } else {
    console.error(formatError(response));
    toast.error("Error loading users");
    return [];
  }
}

const filteredUsers = async () => {
  const users = await reqGetUsers();

  if (!filterUser.value || !filterType.value) {
    return users;
  }

  const filterF = (u: ListUser<string>) => {
    return u[filterType.value] === filterUser.value;
  };

  return users.filter(filterF);
}

const update = async () => {
  filterUser.value = route.query?.userId?.toString();
  users.value = await filteredUsers();
};

onMounted(async () => await update());
</script>

<style scoped>
</style>
