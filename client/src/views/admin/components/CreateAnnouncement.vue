<template>
  <div class="panel panel-default mt-1 mb-4">
    <div class="panel-heading">
      <h4 class="panel-title">Create Announcement</h4>
    </div>
    <div class="panel-body">
      <form>
        <div class="form-group mb-2">
          <label for="announcement-title">Title</label>
          <input type="text" class="form-control" id="announcement-title" placeholder="Title">
        </div>
        <div class="form-group mb-2">
          <label for="announcement-date">Date (UTC)</label>
          <input type="datetime-local" class="form-control" id="announcement-date" placeholder="Date">
        </div>
        <div class="form-group mb-2">
          <label for="announcement-content">Content</label>
          <textarea class="form-control" id="announcement-content" rows="3" placeholder="Content"></textarea>
        </div>

        <button type="submit" class="btn btn-default">Create</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "CreateAnnouncement"
}
</script>

<style scoped>

</style>
