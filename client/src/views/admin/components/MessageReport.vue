<template>
  <div v-if="report.reportedMessageId" class="mb-2">
    <button v-if="!conversation" class="btn btn-primary" type="button" @click="showMessages">
      Show attached messages
    </button>
    <div v-if="conversation" class="well report-messages">
      <div v-for="message in messages" :key="message._id" class="panel">
        <div class="panel-header">
          <h6 class="panel-title" :class="isReportedMessage(message) ? 'text-danger' : null">
            {{ message.sentDate }}: {{ message.fromPlayerAlias }}
          </h6>
        </div>
        <div class="panel-body">
          <p :class="isReportedMessage(message) ? 'text-danger' : null">{{ message.message }}</p>
        </div>
      </div>
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
      conversation: null,
      messages: null
    }
  },
  methods: {
    isReportedMessage (msg) {
      return msg._id === this.report.reportedMessageId;
    },
    async showMessages () {
      const resp = await AdminApiService.getConversationForReport(this.report._id);

      this.conversation = resp.data;
      this.messages = this.conversation.messages.filter(msg => msg.type === 'message');
    }
  }
}
</script>

<style scoped>
.report-messages {
  border: 1px solid rgba(255,255,255,.3);
  border-radius: 4px;
  padding: 8px;
}
</style>
