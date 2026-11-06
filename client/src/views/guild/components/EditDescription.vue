<template>
  <div v-if="!isEditing">
    <markdown-content :markdown="description" />
    <button v-if="canEdit" class="btn btn-primary" @click="startEdit">
      <i class="fas fa-pencil-alt"></i> Edit Description
    </button>
  </div>

  <form v-else class="mb-3" @submit.prevent="save">
    <div class="mb-2">
      <label for="guild-description">Guild Description</label>
      <textarea
        id="guild-description"
        class="form-control"
        rows="4"
        maxlength="2048"
        name="description"
        v-model="draft"
        :disabled="isSaving"
      ></textarea>
    </div>

    <form-error-list :errors="errors" />

    <button
      type="button"
      class="btn btn-sm btn-danger"
      :disabled="isSaving"
      @click="cancel"
    >
      Cancel
    </button>
    <button type="submit" class="btn btn-sm btn-info" :disabled="isSaving">
      <i class="fas fa-check"></i> Save
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";
import MarkdownContent from "../../components/MarkdownContent.vue";
import FormErrorList from "../../components/FormErrorList.vue";
import { extractErrors, formatError, isOk } from "@solaris/api-client";
import { updateGuildDescription } from "@solaris/api-client/guild";
import { httpInjectionKey } from "@/services/http";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  description: string;
  canEdit: boolean;
}>();

const emit = defineEmits<{ (e: "onDescriptionUpdated"): void }>();

const httpClient = inject(httpInjectionKey)!;
const toast = useToast();

const isEditing = ref(false);
const isSaving = ref(false);
const draft = ref("");
const errors = ref<string[]>([]);

const startEdit = () => {
  draft.value = props.description;
  errors.value = [];
  isEditing.value = true;
};

const cancel = () => {
  errors.value = [];
  isEditing.value = false;
};

const save = async () => {
  isSaving.value = true;

  const response = await updateGuildDescription(httpClient)(draft.value);
  if (isOk(response)) {
    toast.success("Guild description updated.");
    isEditing.value = false;
    emit("onDescriptionUpdated");
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isSaving.value = false;
};
</script>
