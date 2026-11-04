<template>
  <button
    type="button"
    class="btn btn-sm btn-outline-info"
    title="Copy link to clipboard"
    @click="copyLink"
  >
    <i class="fas fa-copy"></i>
  </button>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  paramName: string;
  paramValue: string;
}>();

const route = useRoute();
const toast = useToast();

const copyLink = async () => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === "string") {
      query.set(key, value);
    }
  }

  query.set(props.paramName, props.paramValue);

  const url = `${window.location.origin}/#${route.path}?${query}`;

  try {
    await navigator.clipboard.writeText(url);
    toast.default(`Copied to clipboard.`, { type: "success" });
  } catch (err) {
    console.error(err);
    toast.error("Failed to copy to clipboard");
  }
};
</script>

<style scoped></style>
