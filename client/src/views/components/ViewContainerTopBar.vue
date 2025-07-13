<template>
<div id="header" class="app-header">
  <div class="brand">
    <a href="javascript:;" class="brand-logo" @click="goHome">
      <span class="brand-img"></span>
      <span class="brand-text">SOLARIS</span>
    </a>
  </div>

  <div class="menu" v-if="userId">
    <button v-if="userIsImpersonated" @click="doEndImpersonate()" class="btn btn-success">
      End Impersonation
    </button>
    <div class="menu-item dropdown dropdown-mobile-full">
      <router-link :to="{ name: 'administration-games'}" v-if="userHasAdminRole" class="menu-link">
        <div class="menu-icon"><i class="fas fa-users-cog"></i></div>
        <div class="menu-text d-sm-block d-none ms-1">Admin</div>
      </router-link>
    </div>
    <div class="menu-item dropdown dropdown-mobile-full">
      <router-link :to="{ name: 'galactic-credits-shop'}" class="menu-link">
        <div class="menu-icon"><i class="fas fa-coins"></i></div>
        <div class="menu-text d-sm-block d-none ms-1">{{userCredits}} Credit{{userCredits === 1 ? '' : 's'}}</div>
      </router-link>
    </div>
    <div class="menu-item dropdown dropdown-mobile-full">
      <router-link :to="{ name: 'avatars'}" class="menu-link">
        <div class="menu-icon"><i class="fas fa-shopping-basket"></i></div>
        <div class="menu-text d-sm-block d-none ms-1">Shop</div>
      </router-link>
    </div>
    <div class="menu-item dropdown dropdown-mobile-full">
      <a href="#" data-bs-toggle="dropdown" data-bs-display="static" class="menu-link">
        <div class="menu-icon"><i class="fas fa-user"></i></div>
        <div class="menu-text d-sm-block d-none ms-1">{{username}}</div>
      </a>
      <div class="dropdown-menu dropdown-menu-end me-lg-3 fs-11px mt-1">
        <router-link to="/account/settings" class="dropdown-item d-flex align-items-center">
          ACCOUNT <i class="fas fa-user ms-auto text-theme fs-16px my-n1"></i>
        </router-link>
        <router-link :to="{ name: 'account-achievements', params: { userId: userId }}" class="dropdown-item d-flex align-items-center">
          ACHIEVEMENTS <i class="fas fa-medal ms-auto text-theme fs-16px my-n1"></i>
        </router-link>
        <div class="dropdown-divider"></div>
        <a href="javascript:;" @click="logout" :disabled="isLoggingOut" class="dropdown-item d-flex align-items-center">
          LOGOUT <i class="fas fa-sign-out-alt ms-auto text-theme fs-16px my-n1"></i>
        </a>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import router from '../../router'
import authService from '../../services/api/auth'
import { ref, computed, inject } from 'vue';
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import type { UserRoles } from '@solaris-common';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { endImpersonate } from '@/services/typedapi/admin';
import { toastInjectionKey } from '@/util/keys';

const store: Store<State> = useStore();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const userId = computed(() => store.state.userId);
const username = computed(() => store.state.username);
const userCredits = computed(() => store.state.userCredits);

const userHasAdminRole = computed(() => {
  const roles: UserRoles = store.state.roles;

  return roles?.administrator || roles?.communityManager || roles?.gameMaster;
});

const userIsImpersonated = computed(() => store.state.isImpersonating);


const isLoggingOut = ref(false);

const doEndImpersonate = async () => {
  const response = await endImpersonate(httpClient)();

  if (isOk(response)) {
    store.commit('setUserId', response.data._id);
    store.commit('setUsername', response.data.username);
    store.commit('setRoles', response.data.roles);
    store.commit('setUserCredits', response.data.credits);
    store.commit('setIsImpersonating', undefined);

    router.push({name: 'home'})
  } else {
    console.error(formatError(response));
    toast.error("Failed to end impersonation");
  }
};

const goHome = () => {
  router.push({name: 'home'})
};

const logout = async () => {
  isLoggingOut.value = true;

  await authService.logout();

  store.commit('clearUser');
  store.commit('clearUsername');
  store.commit('clearRoles');
  store.commit('clearUserCredits');
  store.commit('clearUserIsEstablishedPlayer');
  store.commit('clearIsImpersonating');

  isLoggingOut.value = false;

  router.push({ name: 'home' });
};
</script>

<style scoped>
.row {
  padding-bottom: 15px;
}

.container {
  font-size: 20px;
}
</style>
