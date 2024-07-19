<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">{{ announcement.title }}</h3>
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

</style>
