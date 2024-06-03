<template>
  <div v-if="report.reportedMessageId" class="mb-2">
    <button v-if="!conversation" class="btn btn-primary" type="button" @click="showMessages">
      Show attached messages
    </button>
    <div v-if="conversation" class="well report-messages">

    </div>
  </div>
</template>

<script>
import AdminApiService from "../../../services/api/admin";

export default {
  name: "MessageReport",
  props: {
    report: Object
  },
  data () {
    return {
      conversation: null
    }
  },
  methods: {
    async showMessages () {
      this.conversation = await AdminApiService.getConversationForReport(this.report._id);
    }
  }
}
</script>

<style scoped>

</style>
