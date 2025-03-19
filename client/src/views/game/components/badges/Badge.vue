<template>
    <div v-if="badgeName" class="badge-container" @click="onOpenPurchasePlayerBadgeRequested">
        <img class="badge-img" :src="badgeSrc" :title="badge.badge" :alt="badgeName"/>
        <span class="badge-label" :title="badgeName">{{badgeName}}</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {AwardedBadge, Badge} from "@solaris-common";

const props = defineProps<{
  badge: AwardedBadge<string>,
  allBadges: Badge[],
}>();

const emit = defineEmits<{
  onOpenPurchasePlayerBadgeRequested: []
}>();

const onOpenPurchasePlayerBadgeRequested = () => {
  emit('onOpenPurchasePlayerBadgeRequested');
}

const badgeName = computed(() => props.allBadges.find(b => b.key === props.badge.badge)?.name);

const badgeSrc = computed(() => new URL(`../../../../assets/badges/${props.badge.badge}.png`, import.meta.url).href)
</script>

<style scoped>
.badge-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.badge-img {
  width: 70px;
  height: 70px;
}

.badge-label {
  font-size: 14px;
  padding: 4px;
  color: white;
  background-color: #333333;
  border-radius: 4px;
}
</style>
