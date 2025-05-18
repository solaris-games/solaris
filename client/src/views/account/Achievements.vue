<template>
  <view-container :is-auth-page="false">
    <view-title :title="user ? user.username : 'Achievements'" />

    <roles v-if="user" :user="user" :displayText="true" />

    <loading-spinner :loading="!user" />

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
import { ref, inject, onMounted, computed, type Ref } from 'vue';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { getAchievements } from '@/services/typedapi/user'
import type {AchievementsUser} from "@solaris-common";
import { useRoute } from 'vue-router';
import AchievementStats from "@/views/account/components/AchievementStats.vue";

const httpClient = inject(httpInjectionKey)!;

const route = useRoute();
const userId = computed(() => route.params.userId as string);

const user: Ref<AchievementsUser<string> | null> = ref(null);

onMounted(async () => {
  const response = await getAchievements(httpClient)(userId.value);

  if (isOk(response)) {
    user.value = response.data
  } else {
    console.error(formatError(response));
  }
});
</script>

<style scoped>
.user-level-icon {
  height: 28px;
}
</style>
