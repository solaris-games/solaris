<template>
    <div v-if="badgeName" class="badge-container" @click="onOpenPurchasePlayerBadgeRequested">
        <img :src="badgeSrc" :title="badge.badge" :alt="badgeName"/>
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
img {
    width: 110px;
    height: 110px;
}

@media screen and (max-width: 576px) {
    img {
        width: 95px;
        height: 95px;
    }
}

.badge-container {
    display: inline-block;
    position: relative;
    cursor: pointer;
}

.badge-label {
    position: absolute;
    right: 8px;
    top: 8px;
    font-size: 20px;
    background: #e74c3c;
    padding: 0px 8px;
    border-radius: 5px;
}
</style>
