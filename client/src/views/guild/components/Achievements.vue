<template>
  <div v-if="achievements?.length" class="mt-2 mb-1">
    <ul class="list-unstyled">
      <li v-for="(achievement, index) in achievements" :key="index">
        <i :class="getIconClass(achievement.icon)" class="me-2 mt-1 text-warning"></i>
        <span>{{ achievement.description }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type {GuildAchievement} from "@solaris/common";

const props = defineProps<{
  achievements: GuildAchievement[],
}>();

const getIconClass = (icon: string) => {
  const map = {
    victory: 'fas fa-trophy'
  };
  return map[icon] || 'fas fa-star';
};
</script>
