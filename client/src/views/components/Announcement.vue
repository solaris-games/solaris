<template>
  <div class="panel panel-default announcement">
    <div class="panel-heading">
      <h5 class="panel-title">{{ announcement.title }}</h5>
      <p class="text-muted">{{ date }}</p>
    </div>
    <div class="panel-body">
      {{ announcement.content }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Announcement",
  props: {
    announcement: Object
  },
  computed: {
    date () {
      return new Date(this.announcement.date).toLocaleString()
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
</style>
