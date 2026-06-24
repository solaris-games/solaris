<template>
<header class="solaris-header">
  <a href="javascript:;" class="solaris-header-el logo-link" @click="goHome">
    <img class="solaris-logo" alt="Solaris Logo" :src="solarisLogo" />
    <span class="solaris-name">SOLARIS</span>
  </a>

  <nav class="solaris-header-el" v-if="userId">
    <button v-if="userIsImpersonated" @click="doEndImpersonate()" class="btn btn-success">
      End Impersonation
    </button>
    <div class="solaris-menu-item">
      <router-link :to="{ name: 'administration-games'}" v-if="userHasAdminRole" class="menu-link">
        <div class="menu-icon"><i class="fas fa-users-cog"></i></div>
        <div class="menu-text d-sm-block d-none ms-1">Admin</div>
      </router-link>
    </div>
    <div class="solaris-menu-item">
      <router-link :to="{ name: 'galactic-credits-shop'}" class="menu-link">
        <div class="menu-icon"><i class="fas fa-coins"></i></div>
        <div class="menu-text d-sm-block d-none ms-1">{{userCredits}} Credit{{userCredits === 1 ? '' : 's'}}</div>
      </router-link>
    </div>
    <div class="solaris-menu-item">
      <router-link :to="{ name: 'avatars'}" class="menu-link">
        <div class="menu-icon"><i class="fas fa-shopping-basket"></i></div>
        <div class="menu-text d-sm-block d-none ms-1">Shop</div>
      </router-link>
    </div>
    <div class="solaris-menu-item dropdown">
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
        <a href="javascript:;" @click="doLogout" :disabled="isLoggingOut" class="dropdown-item d-flex align-items-center">
          LOGOUT <i class="fas fa-sign-out-alt ms-auto text-theme fs-16px my-n1"></i>
        </a>
      </div>
    </div>
  </nav>
</header>
</template>

<script setup lang="ts">
import solarisLogo from '../../assets/solaris_logo_small.png';
import router from '../../router';
import { ref, computed, inject } from 'vue';
import type { UserRoles } from '@solaris/common';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { endImpersonate } from '@/services/typedapi/admin';
import {logout} from "@/services/typedapi/auth";
import { useUserStore } from '@/stores/user';
import { useToast } from 'vue-toast-notification';

const userStore = useUserStore();

const httpClient = inject(httpInjectionKey)!;
const toast = useToast();

const userId = computed(() => userStore.userId);
const username = computed(() => userStore.username);
const userCredits = computed(() => userStore.credits);

const userHasAdminRole = computed(() => {
  const roles: UserRoles | null = userStore.roles;

  return roles?.administrator || roles?.communityManager || roles?.gameMaster;
});

const userIsImpersonated = computed(() => userStore.isImpersonating);


const isLoggingOut = ref(false);

const doEndImpersonate = async () => {
  const response = await endImpersonate(httpClient)();

  if (isOk(response)) {
    userStore.setUserId(response.data._id);
    userStore.setUsername(response.data.username);
    userStore.setRoles(response.data.roles);
    userStore.setCredits(response.data.credits);
    userStore.setIsImpersonating(undefined);

    router.push({name: 'home'})
  } else {
    console.error(formatError(response));
    toast.error("Failed to end impersonation");
  }
};

const goHome = () => {
  router.push({name: 'home'})
};

const doLogout = async () => {
  isLoggingOut.value = true;

  const response = await logout(httpClient)();
  if (isOk(response)) {
    userStore.clearAll();

    isLoggingOut.value = false;

    router.push({ name: 'home' });
  } else {
    console.error(formatError(response));
  }
};
</script>

<style scoped>
.solaris-header {
  flex-shrink: 0;
  background-color: rgba(29,40,53,.95);
  display: flex;
  flex-direction: row;
  height: 3.25rem;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.solaris-menu-item {
  .menu-icon {
    color: #FFFFFF;
    font-size: 1.25rem;
  }
}

.solaris-header-el {
  padding: 0.25rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.logo-link {
  text-decoration: none;
}

.solaris-name {
  color: #FFFFFF;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 2px;
  text-decoration: none;
}

.solaris-logo {
  height: 2rem;
  width: 2rem;
}
</style>
