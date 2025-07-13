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

<script setup lang="ts">
import { ref, inject, type Ref } from 'vue';
import { httpInjectionKey, isError, formatError, extractErrors, isOk } from "@/services/typedapi";
import { getConversationForReport } from "@/services/typedapi/admin";
import type { Report, Conversation, ConversationMessage } from '@solaris-common';

const props = defineProps<{
  report: Report<string>,
}>();

const httpClient = inject(httpInjectionKey)!;

const conversation: Ref<Conversation<string> | null> = ref(null);
const messages: Ref<ConversationMessage<string>[] | null> = ref(null);

const isReportedMessage = (msg: ConversationMessage<string>) => {
  return msg._id === props.report.reportedMessageId;
};

const showMessages = async () => {
  const resp = await getConversationForReport(httpClient)(props.report._id);

  if (isOk(resp)) {
    const conv = resp.data;
    conversation.value = conv;
    messages.value = conv.messages.filter(msg => msg.type === 'message') as ConversationMessage<string>[];
  } else {
    console.error(formatError(resp));
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
