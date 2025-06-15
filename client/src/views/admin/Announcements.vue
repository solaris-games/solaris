<template>
  <administration-page title="Announcements" name="announcements">
    <loading-spinner :loading="!announcements"/>

    <div v-if="announcements">
      <create-announcement @onAnnouncementCreated="updateAnnouncements" />

      <h4>Announcements</h4>

      <div class="announcement-list" v-for="announcement in announcements" :key="announcement._id">
        <announcement-tile :announcement="announcement">
          <template v-slot:context-actions>
            <button class="btn btn-outline-danger btn-sm" @click="removeAnnouncement(announcement)">Delete</button>
          </template>
        </announcement-tile>
      </div>
    </div>
  </administration-page>
</template>

<script setup lang="ts">
import AdministrationPage from "./AdministrationPage.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import CreateAnnouncement from "./components/CreateAnnouncement.vue";
import AnnouncementTile from "../components/Announcement.vue";
import AdminApiService from "../../services/api/admin";
import { ref, inject, type Ref, onMounted } from 'vue';
import type { Announcement } from "@solaris-common";
import { getAllAnnouncements, deleteAnnouncement } from "@/services/typedapi/admin";
import { isOk, formatError, httpInjectionKey } from "@/services/typedapi";
import { toastInjectionKey } from "@/util/keys";
import { useStore, type Store } from 'vuex';
import type { State } from '@/store';
import { makeConfirm } from "@/util/confirm";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const announcements: Ref<Announcement<string>[] | null> = ref(null);

const updateAnnouncements = async () => {
  const response = await getAllAnnouncements(httpClient)();

  if (isOk(response)) {
    announcements.value = response.data;
  } else {
    const err = formatError(response);
    toast.error(`Error loading announcements: ${err}`);
    console.error(err);
  }
};

const removeAnnouncement = async (announcement: Announcement<string>) => {
  if (await confirm("Delete announcement", `Are you sure you want to delete the announcement "${announcement.title}"?`)) {
    const response = await deleteAnnouncement(httpClient)(announcement._id);

    if (isOk(response)) {
      toast.success('Announcement deleted');
    } else {
      console.error(formatError(response));
      toast.error('Failed to delete announcement');
    }

    await updateAnnouncements();
  }
};

onMounted(async () => {
  await updateAnnouncements();
});
</script>

<style scoped>

</style>
