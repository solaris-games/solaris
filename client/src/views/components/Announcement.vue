<template>
  <div class="panel panel-default announcement mb-2" :class="highlighted ? 'announcement-highlighted' : null">
    <div class="panel-heading announcement-heading">
      <div class="announcement-title">
        <h5 class="panel-title">{{ announcement.title }}</h5>
        <p class="text-muted">{{ date }}</p>
      </div>
      <div class="text-right">
        <slot name="context-actions"></slot>
      </div>
    </div>
    <div class="panel-body" v-html="content">
    </div>
  </div>
</template>

<script>
import { renderMarkdown } from "../../util/markdown";

export default {
  name: "Announcement",
  props: {
    announcement: Object,
    highlighted: Boolean
  },
  computed: {
    date () {
      return new Date(this.announcement.date).toLocaleString()
    },
    content () {
      return renderMarkdown(this.announcement.content);
    }
  }
}
</script>

<style scoped>
.announcement {
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, .3);
  padding: 8px;
}

.announcement-heading {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.announcement-highlighted {
  border-color: #30beff;
}
</style>
