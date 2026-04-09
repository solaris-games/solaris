<template>
  <view-container :is-auth-page="false">
    <view-title :title="user ? user.username : 'Achievements'" />

    <div v-if="loadError" class="text-center pt-3">
      <p>This user could not be found.</p>
      <router-link to="/" class="btn btn-primary">Return Home</router-link>
    </div>

    <roles v-if="user" :user="user" :displayText="true" />

    <loading-spinner :loading="!user && !loadError" />

    <user-guild-info v-if="user" :user="user" />

    <achievements v-if="user" :level="user.achievements.level" :victories="user.achievements.victories"
      :rank="user.achievements.rank" :renown="user.achievements.renown" />

    <user-badges :userId="userId" />

    <achievement-stats v-if="user" :user="user" />
  </view-container>
</template>

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import Achievements from '../game/components/player/Achievements.vue'
import UserGuildInfo from '../guild/components/UserGuildInfo.vue'
import Roles from '../game/components/player/Roles.vue'
import UserBadges from '../game/components/badges/UserBadges.vue'
import { ref, inject, onMounted, computed, watch, type Ref } from 'vue';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { getAchievements } from '@/services/typedapi/user'
import type {AchievementsUser} from "@solaris/common";
import { useRoute } from 'vue-router';
import AchievementStats from "@/views/account/components/AchievementStats.vue";

const httpClient = inject(httpInjectionKey)!;

const route = useRoute();
const userId = computed(() => route.params.userId as string);

const user: Ref<AchievementsUser<string> | null> = ref(null);
const loadError = ref(false);

const loadAchievements = async () => {
  loadError.value = false;
  user.value = null;
  const response = await getAchievements(httpClient)(userId.value);

  if (isOk(response)) {
    user.value = response.data
  } else {
    loadError.value = true;
    console.error(formatError(response));
  }
};

watch(
  userId,
  (_newId, _oldId) => {
    loadAchievements();
  }
)

onMounted(async () => {
  await loadAchievements();
});
</script>

<style scoped>
</style>
