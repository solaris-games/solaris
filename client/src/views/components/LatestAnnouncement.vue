<template>
  <loading-spinner :loading="!announcement" />
  <div class="mt-4" v-if="announcement">
    <h5 class="latest-update-title">Latest Update: {{date}}</h5>

    <details>
      <summary>More...</summary>

      <announcement-panel :announcement="announcement" :highlighted="false" />
    </details>
  </div>
</template>

<script setup lang="ts">
import AnnouncementPanel from "./Announcement.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import type {Announcement} from "@solaris-common";
import { ref, onMounted, computed, inject, type Ref } from 'vue';
import {getLatestAnnouncement} from "@/services/typedapi/announcement";
import {isOk, formatError, httpInjectionKey} from "@/services/typedapi";

const httpClient = inject(httpInjectionKey)!;

const announcement: Ref<Announcement<string> | null> = ref(null);
const date = computed(() => announcement.value && new Date(announcement.value.date).toLocaleString());

onMounted(async () => {
  const response = await getLatestAnnouncement(httpClient)();

  if (isOk(response)) {
    announcement.value = response.data;
  } else {
    console.error(formatError(response));
  }
});
</script>

<style scoped>
.latest-update-title {
  font-size: 1rem;
  font-weight: normal;
}
</style>
