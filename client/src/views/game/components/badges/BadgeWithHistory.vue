<template>
  <div class="badge-with-history-container">
    <img class="badge-img" :src="badgeSrc" :title="badge.badge" :alt="badgeName"/>
    <div class="badge-details text-center">
      <span class="badge-name" :title="badgeName">{{badgeName}}</span>
      <p v-if="hasMoreInfo" class="text-info">Awarded by {{badge.awardedByName}} in
        <router-link :to="{ path: '/game', query: { id: badge.awardedInGame } }">
          {{badge.awardedInGameName}}
        </router-link> on the {{awardedDate}}</p>
      <p v-else-if="awardedDate" class="text-info">Awarded on the {{awardedDate}}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';
import type {AwardedBadge, Badge as BadgeData} from "@solaris-common";

const props = defineProps<{
  badge: AwardedBadge<string>,
  allBadges: BadgeData[],
}>();

const badgeName = computed(() => props.allBadges.find(b => b.key === props.badge.badge)?.name);

const badgeSrc = computed(() => new URL(`../../../../assets/badges/${props.badge.badge}.png`, import.meta.url).href)

const hasMoreInfo = computed(() => Boolean(props.badge.playerAwarded && props.badge.awardedByName && props.badge.awardedInGameName && props.badge.time));

const awardedDate = computed(() => props.badge.time && format(props.badge.time, "P"));
</script>
<style scoped>
.badge-with-history-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
  max-width: 120px;
}

.badge-name {
  font-size: 14px;
  color: white;
  font-weight: bold;
}

.badge-img {
  width: 70px;
  height: 70px;
}

.badge-details {
  font-size: 12px;
  padding: 4px;
  background-color: #333333;
  border-radius: 4px;
}

.badge-details p {
  margin: 0;
}
</style>
