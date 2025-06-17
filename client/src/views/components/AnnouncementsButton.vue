<template>
  <div class="m-1 mb-2">
    <button class="btn btn-info" type="button" @click="openAnnouncements">
      <span class="badge bg-default" v-if="announcementState?.unreadCount">{{ announcementState.unreadCount }}</span>
      Announcements
    </button>
  </div>
</template>

<script setup lang="ts">
import {httpInjectionKey, isOk} from "@/services/typedapi";
import type {AnnouncementState} from "@solaris-common";
import { ref, inject, onMounted } from 'vue';
import {getAnnouncementState} from "@/services/typedapi/announcement";
import router from '@/router';

const httpClient = inject(httpInjectionKey)!;

const announcementState: Ref<AnnouncementState<string> | null> = ref(null);

const openAnnouncements = () => {
  router.push({ name: 'announcements' })
};

onMounted(async () => {
  const resp = await getAnnouncementState(httpClient)();

  if (isOk(resp)) {
    announcementState.value = resp.data;
  } else {
    console.error(formatError(resp));
  }
});
</script>

<style scoped>

</style>
