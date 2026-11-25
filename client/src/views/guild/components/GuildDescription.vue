<template>
  <div v-if="html" class="guild-description mb-2" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { renderMarkdown } from "@/util/markdown.ts";

const props = defineProps<{ markdown: string }>();

const html = computed(() =>
  props.markdown?.trim() ? renderMarkdown(props.markdown) : null,
);
</script>
<style scoped>
.guild-description {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px;
}
</style>
