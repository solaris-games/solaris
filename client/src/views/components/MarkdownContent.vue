<template>
  <div v-if="html" class="markdown-content" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { renderMarkdown } from "../../util/markdown";

const props = defineProps<{ markdown: string }>();

const html = computed(() =>
  props.markdown?.trim() ? renderMarkdown(props.markdown) : null,
);
</script>
