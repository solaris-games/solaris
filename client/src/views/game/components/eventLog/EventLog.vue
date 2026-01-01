<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="Event Log" @onCloseRequested="onCloseRequested">
      <button :disabled="isLoading" class="btn btn-sm btn-success" @click="markAllRead"><i class="fas fa-check"></i> Read All</button>
      <button :disabled="isLoading" class="btn btn-sm btn-outline-primary ms-1" @click="loadEvents"><i class="fas fa-sync"></i><span class="d-none d-sm-inline-block ms-1">Refresh</span></button>
    </menu-title>
  </div>

  <div class="container">
    <div class="row">
      <div class="col-auto">
        <select :disabled="isLoading" class="form-control form-control-sm" v-model="selectedFilter" @change="loadPage(0)">
          <option value="all">All Events</option>
          <option value="gameEvents">Game Events</option>
          <option value="galacticCycles">Galactic Cycles</option>
          <option value="combat">Combat</option>
          <option value="research">Research</option>
          <option value="diplomacy">Diplomacy</option>
          <option value="trade">Trade</option>
          <option value="specialists">Specialists</option>
          <option value="conversations">Conversations</option>
        </select>
      </div>
    </div>

    <div class="row mt-2" v-if="events">
      <div class="col-auto">
        <nav aria-label="Events pagination">
          <ul class="pagination justify-content-end mb-0">
            <li class="page-item" :class="{'disabled': page <= 0}">
              <a class="page-link" href="javascript:;" @click="loadPage(0)">
                <i class="fas fa-angle-double-left"></i>
              </a>
            </li>
            <li class="page-item" :class="{'disabled': page <= 0}">
              <a class="page-link" href="javascript:;" @click="loadPage(page - 1)">
                <i class="fas fa-angle-left"></i>
              </a>
            </li>
            <li class="page-item" v-for="pageNumber of pageNumbers" :key="pageNumber" :class="{'active': page === pageNumber}">
              <a class="page-link" href="javascript:;" @click="loadPage(pageNumber)">{{pageNumber + 1}}</a>
            </li>
            <li class="page-item" :class="{'disabled': page >= pageMax}">
              <a class="page-link" href="javascript:;" @click="loadPage(page + 1)">
                <i class="fas fa-angle-right"></i>
              </a>
            </li>
            <li class="page-item" :class="{'disabled': page >= pageMax}">
              <a class="page-link" href="javascript:;" @click="loadPage(pageMax)">
                <i class="fas fa-angle-double-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>

  <loading-spinner :loading="isLoading"/>

  <div class="mt-2 events-container container" v-if="events && events.length">
    <events-list-item v-for="event in events" :key="event._id" :event="event"
                      @onOpenStarDetailRequested="onOpenStarDetailRequested"
                      @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
                      @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
  </div>

  <div class="text-center pt-3 pb-3" v-if="!isLoading && events && !events.length">
    No Events.
  </div>
</div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import EventsListItem from './events/EventsListItem.vue';
import { inject, ref, computed, onMounted } from 'vue';
import type {GameEvent} from "@solaris-common";
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import {listEvents, markAllAsRead} from "@/services/typedapi/event";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenPlayerDetailRequested: [playerId: string],
  onOpenStarDetailRequested: [starId: string],
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const onOpenStarDetailRequested = (starId: string) => emit('onOpenStarDetailRequested', starId);

const onOpenCarrierDetailRequested = (carrierId: string) => emit('onOpenCarrierDetailRequested', carrierId);

const onCloseRequested = () => emit('onCloseRequested');

const events = ref<GameEvent<string>[]>([]);
const isLoading = ref(false);
const count = ref(0);
const page = ref(0);
const pageSize = ref(30);
const pageMax = ref(0);
const selectedFilter = ref('all');

const pageNumbers = computed(() => {
  const pages: number[] = [];
  const depth = 2;

  for (let i = page.value - depth; i < page.value; i++) {
    if (i >= 0 && i <= pageMax.value) {
      pages.push(i);
    }
  }

  for (let i = page.value; i < page.value + depth; i++) {
    if (i <= pageMax.value) {
      pages.push(i);
    }
  }

  return pages;
})

const loadEvents = async () => {
  isLoading.value = true;

  const response = await listEvents(httpClient)(game.value._id, page.value, pageSize.value, selectedFilter.value);

  if (isOk(response)) {
    count.value = response.data.count;
    events.value = response.data.events as GameEvent<string>[]; // we assume that this covers all possible events

    pageMax.value = Math.floor(count.value / pageSize.value);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const loadPage = (pageNumber: number) => {
  if (pageNumber >= 0 && pageNumber <= pageMax.value) {
    page.value = pageNumber;

    loadEvents();
  }
};

const markAllRead = async () => {
  const response = await markAllAsRead(httpClient)(game.value._id);
  if (isOk(response)) {
    events.value.forEach(ev => {
      ev.read = true;
    });
  }
};

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.events-container {
  max-height: 600px;
  overflow: auto;
}
</style>
