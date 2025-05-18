<template>
  <view-container :is-auth-page="true">
    <view-title title="Account" />

    <loading-spinner :loading="!info" />

    <div v-if="info">
      <roles :user="info" />

      <div class="row pt-3 pb-3 bg-dark">
        <div class="col">
          <p>Galactic Credits</p>
          <p><small>Purchase credits in the shop or earn credits by winning official games.</small></p>
        </div>
        <div class="col-auto">
          <p class="text-end">
            <i class="fas fa-coins me-2"></i>
            <strong>{{ info.credits }}</strong> credit<span v-if="info.credits !== 1">s</span>
            <router-link :to="{ name: 'galactic-credits-shop' }" class="btn btn-success ms-2"><i
                class="fas fa-shopping-cart"></i> Store</router-link>
          </p>
        </div>
      </div>

      <view-subtitle title="Account settings" class="mt-3" />

      <div class="row pt-2 pb-2">
        <div class="col">
          <p>Username</p>
        </div>
        <div class="col">
          <p class="text-end">
            {{ info.username }}
            <router-link to="/account/reset-username" tag="a"><i class="fas fa-pencil-alt"></i></router-link>
          </p>
        </div>
      </div>

      <div class="row pt-2 pb-2">
        <div class="col">
          <p>Email Address</p>
        </div>
        <div class="col">
          <p class="text-end">
            {{ info.email }}
            <router-link to="/account/reset-email" tag="a"><i class="fas fa-pencil-alt"></i></router-link>
          </p>
        </div>
      </div>

      <div class="mt-3 text-end">
        <button :disabled="isClosingAccount" class="btn btn-outline-danger" @click="closeAccount"><i
            class="fas fa-trash"></i> Delete Account</button>
        <router-link to="/account/reset-password" tag="button" class="btn btn-primary ms-1"><i class="fas fa-lock"></i>
          Change Password</router-link>
      </div>

      <view-subtitle title="Notifications" class="mt-3" />

      <view-subtitle title="Email notifications" class="mt-3" level="h5" />

      <div class="row pt-2 pb-2">
        <div class="col">
          <p>Email Game Notifications</p>
        </div>
        <div class="col text-end">
          <button v-if="info.emailEnabled" :disabled="isChangingEmailNotifications"
            @click="toggleEmailNotifications(false)" class="btn btn-success">
            Enabled
            <i class="fas fa-check"></i>
          </button>
          <button v-if="!info.emailEnabled" :disabled="isChangingEmailNotifications"
            @click="toggleEmailNotifications(true)" class="btn btn-danger">
            Disabled
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="row pt-2 pb-2">
        <div class="col">
          <p>Email Updates &amp; Newsletters</p>
        </div>
        <div class="col text-end">
          <button v-if="info.emailOtherEnabled" :disabled="isChangingEmailNotifications"
            @click="toggleEmailOtherNotifications(false)" class="btn btn-success">
            Enabled
            <i class="fas fa-check"></i>
          </button>
          <button v-if="!info.emailOtherEnabled" :disabled="isChangingEmailNotifications"
            @click="toggleEmailOtherNotifications(true)" class="btn btn-danger">
            Disabled
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="row pt-2 pb-2">
        <div class="col">
          <p>Discord Game Notifications</p>
          <p><small><strong>You must be a member</strong> of the official Solaris discord server.</small></p>
        </div>
        <div class="col text-end">
          <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" class="btn btn-secondary me-1">
            Join
            <i class="fab fa-discord"></i>
          </a>
          <a class="btn btn-success" v-if="isAuthenticatedWithDiscord" @click="unlinkDiscordAccount">
            Connected
            <i class="fas fa-check"></i>
          </a>
          <a id="discordLogin" class="btn btn-secondary" v-if="!isAuthenticatedWithDiscord" :href="discordOauthURL">
            Setup
            <i class="fas fa-cog"></i>
          </a>
        </div>
      </div>
    </div>

    <notifications v-if="isAuthenticatedWithDiscord" />

    <view-subtitle title="Game Options" class="mt-3" />

    <options-form :is-in-game="false" />
  </view-container>
</template>

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ViewSubtitle from '../components/ViewSubtitle.vue'
import OptionsForm from '../game/components/menu/OptionsForm.vue'
import authService from '../../services/api/auth'
import router from '../../router'
import Roles from '../game/components/player/Roles.vue'
import Notifications from "./components/Notifications.vue";
import { inject, onMounted, ref, computed, type Ref } from 'vue'
import { formatError, httpInjectionKey, isOk, unwrapOk } from '@/services/typedapi'
import { deleteUser, detailMe, updateEmailOtherPreference, updateEmailPreference } from '@/services/typedapi/user'
import type { UserPrivate } from '@solaris-common'
import { toastInjectionKey } from '@/util/keys'
import type { State } from "@/store";
import { useStore, type Store } from 'vuex';
import { makeConfirm } from '@/util/confirm'
import { useRoute } from 'vue-router';

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const route = useRoute();
const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const info: Ref<UserPrivate<string> | null> = ref(null);
const isChangingEmailNotifications = ref(false);
const isClosingAccount = ref(false);

const discordOauthURL = import.meta.env.VUE_APP_DISCORD_OAUTH_URL;
const isAuthenticatedWithDiscord = computed(() => info.value?.oauth?.discord?.userId != null);

const toggleEmailNotifications = async (enabled: boolean) => {
  if (!info.value) {
    return;
  }

  info.value.emailEnabled = enabled

  try {
    isChangingEmailNotifications.value = true

    unwrapOk(await updateEmailPreference(httpClient)(info.value.emailEnabled));
  } catch (err) {
    toast.error("An error occured");
    console.error(err)
  }

  isChangingEmailNotifications.value = false
};

const toggleEmailOtherNotifications = async (enabled: boolean) => {
  if (!info.value) {
    return;
  }

  info.value.emailOtherEnabled = enabled

  try {
    isChangingEmailNotifications.value = true

    await updateEmailOtherPreference(httpClient)(info.value.emailOtherEnabled);
  } catch (err) {
    toast.error("An error occured");
    console.error(err)
  }

  isChangingEmailNotifications.value = false
};

const closeAccount = async () => {
  if (await confirm('Delete account', 'Are you sure you want to close your account?')) {
    if (await confirm('Delete account', 'Are you absolutely sure you want to close your account? We will remove all of your data and it cannot be recovered.')) {
      if (!await confirm('Delete account', 'Last chance?')) {
        return
      }
    } else {
      return
    }
  } else {
    return
  }

  isClosingAccount.value = true

  const response = await deleteUser(httpClient)();

  if (isOk(response)) {
    router.push({ name: 'home' })
  } else {
    console.error(formatError(response));

    toast.error("Failed to close account, please contact a developer");
  }

  isClosingAccount.value = false
};

const unlinkDiscordAccount = async () => {
  if (!info.value) {
    return;
  }

  if (!await confirm('Disconnect Discord', 'Are you sure you want to disconnect Discord? You will no longer receive any notifications from event subscriptions.')) {
    return
  }

  try {
    let response = await authService.clearOauthDiscord()

    if (response.status === 200) {
      toast.success(`Successfully disconnected from Discord`)

      info.value.oauth.discord = undefined;
    } else {
      toast.error(`There was a problem disconnecting from Discord, please try again.`)
    }
  } catch (err) {
    console.error(err)
  }
};

onMounted(async () => {
  const response = await detailMe(httpClient)();

  if (isOk(response)) {
    info.value = response.data
  } else {
    console.error(formatError(response));
    toast.error("Failed to load account settings");
  }

  const discordSuccess = route.query.discordSuccess;

  if (discordSuccess === 'true') {
    toast.success(`Successfully authenticated with Discord!`)
  } else if (discordSuccess === 'false') {
    toast.error(`There was a problem connecting to Discord, please try again.`)
  }
});
</script>

<style scoped>
p {
  margin-bottom: 0;
}
</style>
