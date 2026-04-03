import {computed, inject, readonly, ref } from 'vue';
import { defineStore } from 'pinia';
import type {UserPrivate, UserRoles} from "@solaris-common";
import {httpInjectionKey, formatError, isOk} from "@/services/typedapi";
import {UserClientSocketEmitter, userClientSocketEmitterInjectionKey} from "@/sockets/socketEmitters/user";
import {verify as verifyApi} from "@/services/typedapi/auth";
import {detailMe} from "@/services/typedapi/user";
import type { Axios } from "axios";

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<UserPrivate<string> | null>(null);
  const userId = ref<string | null>(null);
  const username = ref<string | null>(null);
  const roles = ref<UserRoles | null>(null);
  const credits = ref<number | null>(null);
  const isImpersonating = ref<boolean | null>(null);
  const isEstablishedPlayer = ref<boolean | null>(null);

  // Computed getters
  const isLoggedIn = computed(() => userId.value !== null);
  const isAdmin = computed(() => roles.value?.administrator === true);

  // Convenience method - updates all properties at once
  const setUser = (newUser: UserPrivate<string>) => {
    user.value = newUser;
    userId.value = newUser._id;
    username.value = newUser.username;
    roles.value = newUser.roles;
    credits.value = newUser.credits;
  };

  // Individual property setters
  const setUserId = (id: string) => {
    userId.value = id;
  };

  const setUsername = (name: string) => {
    username.value = name;
  };

  const setRoles = (newRoles: UserRoles) => {
    roles.value = newRoles;
  };

  const setCredits = (newCredits: number) => {
    credits.value = newCredits;
  };

  const setIsImpersonating = (impersonating: boolean | undefined) => {
    isImpersonating.value = impersonating === undefined ? null : impersonating;
  };

  const setIsEstablishedPlayer = (established: boolean) => {
    isEstablishedPlayer.value = established;
  };

  // Clear all user state
  const clearAll = () => {
    user.value = null;
    userId.value = null;
    username.value = null;
    roles.value = null;
    credits.value = null;
    isImpersonating.value = null;
    isEstablishedPlayer.value = null;
  };

  // Verify authentication action
  const verify = async (httpClient: Axios, userClientSocketEmitter: UserClientSocketEmitter): Promise<boolean> => {
    const response = await verifyApi(httpClient)();
    if (isOk(response)) {
      if (response.data._id) {
        setUserId(response.data._id);
        setUsername(response.data.username);
        setRoles(response.data.roles);
        setCredits(response.data.credits);

        if (!user.value || user.value?._id !== response.data._id) {
          const resp2 = await detailMe(httpClient)();
          if (isOk(resp2)) {
            setUser(resp2.data);
            if (userClientSocketEmitter) {
              userClientSocketEmitter.emitJoined();
            }
          } else {
            console.error('Failed to get user info', resp2);
          }
        }

        return true;
      } else {
        return false;
      }
    } else {
      console.error(formatError(response));
      return false;
    }
  };

  return {
    // State (readonly)
    user: readonly(user),
    userId: readonly(userId),
    username: readonly(username),
    roles: readonly(roles),
    credits: readonly(credits),
    isImpersonating: readonly(isImpersonating),
    isEstablishedPlayer: readonly(isEstablishedPlayer),

    // Computed getters
    isLoggedIn,
    isAdmin,

    // Actions
    setUser,
    setUserId,
    setUsername,
    setRoles,
    setCredits,
    setIsImpersonating,
    setIsEstablishedPlayer,
    clearAll,
    verify,
  };
});
