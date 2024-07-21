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

<script>
import FormErrorList from "../../components/FormErrorList.vue";
import AdminApiService from "../../../services/api/admin";

export default {
  name: "CreateAnnouncement",
  components: {
    'form-error-list': FormErrorList
  },
  data () {
    return {
      title: '',
      date: '',
      content: '',
      errors: [],
    }
  },
  methods: {
    async submit () {
      const announcement = {
        title: this.title,
        date: this.date,
        content: this.content
      };

      this.title = '';
      this.date = '';
      this.content = '';

      const resp = await AdminApiService.createAnnouncement(announcement);

      if (resp.status !== 201) {
        this.errors = resp.data.errors;
      }

      this.$emit('onAnnouncementCreated')
    },
  },
  computed: {
    canSubmit () {
      return Boolean(this.title && this.date && this.content);
    },
  }
}
</script>

<style scoped>

</style>
