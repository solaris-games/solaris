import {readonly, ref } from 'vue';
import { defineStore } from 'pinia';
import type {UserPrivate, UserRoles} from "@solaris-common";

export const useUserStore = defineStore('user', () => {
  const user = ref<UserPrivate<string> | null>(null);
  const userId = ref<string | null>(null);
  const username = ref<string | null>(null);
  const roles = ref<UserRoles | null>(null);
  const credits = ref<number | null>(null);

  const setUser = (newUser: UserPrivate<string>) => {
    user.value = newUser;
    userId.value = newUser._id;
    username.value = newUser.username;
    roles.value = newUser.roles;
    credits.value = newUser.credits;
  };

  return {
    user: readonly(user),
    userId: readonly(userId),
    username: readonly(username),
    roles: readonly(roles),
    credits: readonly(credits),
    setUser,
  };
});
