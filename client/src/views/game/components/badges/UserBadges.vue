<template>
  <div>
    <loading-spinner :loading="isLoading"/>

    <div class="pt-3 pb-3" v-if="!isLoading && badges.length">
      <badge v-for="badge in badges" :key="badge.badge" :badge="badge" :allBadges="allBadges" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, type Ref, inject} from 'vue';
import type {Axios} from 'axios';
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import Badge from './Badge.vue'
import type {State} from "../../../../store";
import {useStore} from 'vuex';
import type {Store} from 'vuex/types/index.js';
import type {AwardedBadge, Badge as TBadge} from "@solaris-common";
import {getBadgesForUser} from "../../../../services/typedapi/badge";
import {httpInjectionKey, isError} from "../../../../services/typedapi";

const props = defineProps<{ userId: string }>();

const isLoading = ref(true);

const allBadges: Ref<TBadge[]> = ref([]);

const badges: Ref<AwardedBadge<string>[]> = ref([]);

const store = useStore() as Store<State>;

const httpClient: Axios = inject(httpInjectionKey)!;

onMounted(async () => {
  isLoading.value = true

  allBadges.value = await store.dispatch('getBadges');

  try {
    const response = await getBadgesForUser(httpClient)(props.userId)

    if (isError(response)) {
      badges.value = [];
      console.error(response.cause);
    } else {
      badges.value = response.data;
    }
  } catch (err) {
    console.error(err)
  }

  isLoading.value = false;
});
</script>

<style scoped>
</style>
