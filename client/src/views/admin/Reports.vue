<template>
  <administration-page title="Reports" name="reports">
    <loading-spinner :loading="!reports"/>

    <div v-if="reports">
      <div class="panel report-element" v-for="report of reports" :key="report._id">
        <div class="panel-heading">
          <h5 class="panel-title" :class="report.actioned ? 'text-default' : 'text-warning'">
            <router-link :to="{ path: '/administration/users/', query: { userId: report.reportedByUserId } }">{{ report.reportedByPlayerAlias }}</router-link>
            reported
            <router-link :to="{ path: '/administration/users/', query: { userId: report.reportedUserId } }">{{ report.reportedPlayerAlias }}</router-link>
            ({{ report.date }})
          </h5>
        </div>
        <div class="panel-body">
          <p>Reasons:
            <span v-if="report.reasons.abuse" class="me-2">Abuse</span>
            <span v-if="report.reasons.spamming" class="me-2">Spamming</span>
            <span v-if="report.reasons.multiboxing" class="me-2">Multiboxing</span>
            <span v-if="report.reasons.inappropriateAlias" class="me-2">Inappropriate Alias</span>
          </p>

          <message-report :report="report" />
        </div>
        <div class="panel-footer">
          <router-link tag="button" class="btn btn-small btn-info me-2" :to="{ path: '/game/detail', query: { id: report.gameId } }">View Game</router-link>
          <button class="btn btn-small" :class="report.actioned ? 'btn-success' : 'btn-danger'">
            <i class="fas clickable"
               :class="{'fa-check':report.actioned,'fa-times':!report.actioned}"
               @click="doActionReport(report)" title="Action Report"></i>
          </button>
        </div>
      </div>
    </div>
  </administration-page>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, type Ref } from "vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AdministrationPage from "./AdministrationPage.vue";
import MessageReport from "./components/MessageReport.vue";
import { type Report } from "@solaris-common";
import { httpInjectionKey, isOk, formatError } from "@/services/typedapi";
import { actionReport, listReports } from "@/services/typedapi/admin";
import { toastInjectionKey } from "@/util/keys";
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import { makeConfirm } from "@/util/confirm";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const reports: Ref<Report<string>[] | null> = ref(null);

const doActionReport = async (report: Report<string>) => {
  if (!await confirm('Action Report', 'Are you sure you want to action this report?')) {
    return
  }

  const response =  await actionReport(httpClient)(report._id);

  if (isOk(response)) {
    report.actioned = true;
  } else {
    console.error(formatError(response));
    toast.error("Failed to action report");
  }
};

const getReports = async () => {
  const response = await listReports(httpClient)();

  if (isOk(response)) {
    reports.value = response.data;
  } else {
    console.error(formatError(response));
    toast.error("Failed to load reports");
  }
};

onMounted(async () => await getReports());
</script>

<style scoped>
.report-element {
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,.3);
  margin: 8px;
  padding: 8px;
}
</style>
