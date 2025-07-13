<template>
  <div class="panel panel-default user-element">
    <div class="panel-heading">
      <h5 class="panel-title">
        {{ user.username }}
        <span v-if="isAdministrator">
              <i class="fas fa-hands-helping clickable" :class="{'disabled-role':!userA.roles.contributor}"
                 @click="toggleRole(user, 'contributor')" title="Toggle Contributor Role"></i>
              <i class="fas fa-code ms-1 clickable" :class="{'disabled-role':!userA.roles.developer}"
                 @click="toggleRole(user, 'developer')" title="Toggle Developer Role"></i>
              <i class="fas fa-user-friends ms-1 clickable" :class="{'disabled-role':!userA.roles.communityManager}"
                 @click="toggleRole(user, 'communityManager')" title="Toggle Community Manager Role"></i>
              <i class="fas fa-dice ms-1 clickable" :class="{'disabled-role':!userA.roles.gameMaster}"
                 @click="toggleRole(user, 'gameMaster')" title="Toggle Game Master Role"></i>
            </span>
      </h5>
    </div>
    <div class="panel-body">
      <p v-if="isAdministrator">Email: {{ userA.email }}</p>
      <p v-if="isAdministrator">Email enabled: {{ userA.emailEnabled }}</p>
      <p v-if="isAdministrator">Last seen: {{ getLastSeenString(userA.lastSeen) }}</p>
      <p v-if="isAdministrator" :class="{'text-warning':duplicateIPs}">Last seen IP:
        {{ userA.lastSeenIP }}</p>

      <p>
        Established Player: {{ user.isEstablishedPlayer }}

        <i v-if="isCommunityManager && !user.isEstablishedPlayer" class="fas fa-user-check clickable text-danger"
           @click="doPromoteToEstablishedPlayer(user)" title="Promote to Established Player"></i>

        <i v-if="user.isEstablishedPlayer" class="fas fa-user-check clickable text-success"></i>
      </p>

      <p v-if="isAdministrator">
        <i :style="[userA.credits <= 0 ? { 'visibility': 'hidden' } : { 'visibility': 'unset' }]"
           class="fas fa-minus clickable text-danger" @click="doSetCredits(user, userA.credits - 1)"
           title="Deduct Credits"></i>
        {{ userA.credits }}
        <i class="fas fa-plus clickable text-success" @click="doSetCredits(user, userA.credits + 1)"
           title="Add Credits"></i>
      </p>

      <div v-if="user.warnings && user.warnings.length">
        <ul class="list-group">
          <li v-for="warning of user.warnings" class="list-group-item">
            <p class="text-warning">{{ warning.date }}: {{ warning.text }}</p>
          </li>
        </ul>
      </div>
    </div>
    <div class="panel-footer">
      <div class="actions">
        <i v-if="isCommunityManager && user._id !== store.state.userId" class="fas fa-hammer clickable text-danger" :class="{'disabled-role':!user.banned}"
           @click="toggleBan(user)" title="Toggle Banned"></i>
        <i v-if="isAdministrator" class="fas fa-eraser clickable text-warning ms-1" @click="doResetAchievements(user)"
           title="Reset Achievements"></i>
        <i v-if="isAdministrator && user._id !== store.state.userId && !store.state.isImpersonating" class="fas fa-user clickable text-info ms-1" @click="doImpersonate(user._id)"
           title="Impersonate User"></i>

        <add-warning v-if="isCommunityManager" :user-id="user._id" @onWarningAdded="onWarningAdded" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import AddWarning from "@/views/admin/components/AddWarning.vue";
import {formatError, httpInjectionKey, isError, isOk, type ResponseResult} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {State} from "@/store";
import {makeConfirm} from "@/util/confirm";
import { useStore, type Store } from 'vuex';
import { inject, computed } from 'vue';
import type {AdminSpecificUserInfo, ListUser, UserRoleKinds} from "@solaris-common";
import moment from "moment/moment";
import {
  ban,
  impersonate,
  promoteToEstablishedPlayer, resetAchievements, setCredits,
  setRoleCommunityManager,
  setRoleContributor,
  setRoleDeveloper, setRoleGameMaster, unban
} from "@/services/typedapi/admin";
import router from "@/router";

const props = defineProps<{
  user: ListUser<string>,
  duplicateIPs: boolean,
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const isAdministrator = computed(() => store.state.roles.administrator);
const isCommunityManager = computed(() => store.state.roles.communityManager || store.state.roles.administrator);
const userA = computed(() => isAdministrator.value && props.user as ListUser<string> & AdminSpecificUserInfo);

const getLastSeenString = (lastSeen: Date) => {
  if (!lastSeen) {
    return ''
  }

  return moment(lastSeen).utc().fromNow();
};

const onWarningAdded = (warning: string) => {
  props.user.warnings.push({
    text: warning,
    date: new Date(),
  });
};

const doPromoteToEstablishedPlayer = async (user: ListUser<string>) => {
  if (user.isEstablishedPlayer) {
    return;
  }

  if (!await confirm('Promote to Established Player', 'Are you sure you want to promote this player to an established player?')) {
    return;
  }

  const response = await promoteToEstablishedPlayer(httpClient)(user._id);

  if (isOk(response)) {
    user.isEstablishedPlayer = true;
  } else {
    console.error(formatError(response));
    toast.error("Failed to promote to established player");
  }
};

const doImpersonate = async (userId: string) => {
  const response = await impersonate(httpClient)(userId);

  if (isOk(response)) {
    store.commit('setUserId', response.data._id);
    store.commit('setUsername', response.data.username);
    store.commit('setRoles', response.data.roles);
    store.commit('setUserCredits', response.data.credits);
    store.commit('setIsImpersonating', response.data.isImpersonating);

    router.push({name: 'home'});
  } else {
    console.error(formatError(response));
    toast.error("Failed to impersonate");
  }
};

const toggleRole = async (user: ListUser<string>, role: UserRoleKinds) => {
  if (!isAdministrator.value) {
    return;
  }

  const userI = user as ListUser<string> & AdminSpecificUserInfo;

  let request: Promise<ResponseResult<null>>;

  switch (role) {
    case 'contributor':
      request = setRoleContributor(httpClient)(userI._id, !userI.roles.contributor);
      break;
    case 'developer':
      request = setRoleDeveloper(httpClient)(userI._id, !userI.roles.developer);
      break;
    case 'communityManager':
      request = setRoleCommunityManager(httpClient)(userI._id, !userI.roles.communityManager);
      break;
    case 'gameMaster':
      request = setRoleGameMaster(httpClient)(userI._id, !userI.roles.gameMaster);
      break;
    default:
      throw new Error(`Role ${role} not recongnized`);
  }

  const response = await request;

  if (isOk(response)) {
    userI.roles[role] = !userI.roles[role];

    if (userI._id === store.state.userId) {
      store.commit('setRoles', userI.roles);
    }
  } else {
    console.error(formatError(response));
    toast.error("Failed to set user role");
  }
};

const doResetAchievements = async (user: ListUser<string>) => {
  if (!await confirm('Reset Achievements', 'Are you sure you want to reset this players achievements?')) {
    return;
  }

  const response = await resetAchievements(httpClient)(user._id);

  if (isError(response)) {
    console.error(formatError(response));
    toast.error("Failed to reset achievements");
  }
};

const doSetCredits = async (user: ListUser<string>, credits: number) => {
  const userI = user as ListUser<string> & AdminSpecificUserInfo;
  const response = await setCredits(httpClient)(userI._id, credits);

  if (isOk(response)) {
    userI.credits = Math.max(credits, 0);

    if (user._id === store.state.userId) {
      store.commit('setUserCredits', response.data.credits);
    }
  } else {
    console.error(formatError(response));
    toast.error("Failed to set credits");
  }
};

const toggleBan = async (user: ListUser<string>) => {
  if (!await confirm('Ban/Unban', 'Are you sure you want to ban/unban this player?')) {
    return;
  }

  let request: Promise<ResponseResult<null>>;

  if (user.banned) {
    request = unban(httpClient)(user._id);
  } else {
    request = ban(httpClient)(user._id);
  }

  const response = await request;

  if (isOk(response)) {
    user.banned = !user.banned;
  } else {
    console.error(formatError(response));
    toast.error("Error banning user");
  }
};

</script>
<style scoped>
.panel-footer {
  border-top: 1px solid rgba(255, 255, 255, .3);
  padding-top: 8px;
}

.user-element {
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, .3);
  margin: 8px;
  padding: 8px;
}

.user-element p {
  margin-bottom: 2px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  align-content: start;
}

.disabled-role {
  opacity: 0.2
}

.clickable {
  cursor: pointer;
}
</style>
