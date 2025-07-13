<template>
  <div class="panel panel-default mt-1 mb-4">
    <div class="panel-heading">
      <h4 class="panel-title">Create Announcement</h4>
    </div>
    <div class="panel-body">
      <form>
        <div class="form-group mb-2">
          <label for="announcement-title">Title</label>
          <input type="text" class="form-control" id="announcement-title" placeholder="Title" v-model="title" required>
        </div>
        <div class="form-group mb-2">
          <label for="announcement-date">Date (UTC)</label>
          <input type="datetime-local" class="form-control" id="announcement-date" placeholder="Date" v-model="date" required>
        </div>
        <div class="form-group mb-2">
          <label for="announcement-content">Content</label>
          <textarea class="form-control" id="announcement-content" rows="3" placeholder="Content" v-model="content" required></textarea>
        </div>

        <form-error-list v-bind:errors="errors" />

        <button type="button" class="btn btn-success" :disabled="!canSubmit" @click="submit">Create</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormErrorList from "../../components/FormErrorList.vue";
import { ref, computed, inject, type Ref } from 'vue';
import { httpInjectionKey, isError, formatError, extractErrors } from "@/services/typedapi";
import { createAnnouncement } from "@/services/typedapi/admin";
import { toastInjectionKey } from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const emit = defineEmits<{
  onAnnouncementCreated: [],
}>();

const title = ref('');
const date = ref('');
const content = ref('');
const errors = ref<string[]>([]);

const canSubmit = computed(() => title.value && date.value && content.value);

const submit = async (e: Event) => {
  e.preventDefault();

  const announcement = {
    title: title.value,
    date: new Date(date.value),
    content: content.value,
  };

  const response = await createAnnouncement(httpClient)(announcement);

  if (isError(response)) {
    console.error(formatError(response));
    toast.error("Error creating announcement");
    errors.value = extractErrors(response);
  }

  emit('onAnnouncementCreated');
}
</script>

<style scoped>

</style>
