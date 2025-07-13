<template>
  <administration-page title="Insights" name="insights">
    <loading-spinner :loading="!insights"/>

    <table class="table table-striped table-hover" v-if="insights">
      <thead class="table-dark">
      <tr>
        <th></th>
        <th>24h</th>
        <th>48h</th>
        <th>1 Week</th>
        <th>2 Weeks</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="insight of insights" :key="insight.name">
        <td>{{ insight.name }}</td>
        <td>{{ insight.d1 }}</td>
        <td>{{ insight.d2 }}</td>
        <td>{{ insight.d7 }}</td>
        <td>{{ insight.d14 }}</td>
      </tr>
      </tbody>
    </table>
  </administration-page>
</template>

<script setup lang="ts">
import { formatError, httpInjectionKey, isOk } from "@/services/typedapi";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AdministrationPage from "./AdministrationPage.vue";
import { inject, ref, onMounted, type Ref } from 'vue';
import type { GetInsight } from "@solaris-common";
import { getInsights } from "@/services/typedapi/admin";
import { toastInjectionKey } from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const insights: Ref<GetInsight[] | null> = ref(null);

const load = async () => {
  const response = await getInsights(httpClient)();

  if (isOk(response)) {
    insights.value = response.data;
  } else {
    console.error(formatError(response));
    toast.error("Error loading insights");
  }
};

onMounted(async () => await load());
</script>

<style scoped>

</style>
