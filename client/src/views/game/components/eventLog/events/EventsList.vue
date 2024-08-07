<template>
<div>
  <loading-spinner :loading="!events"/>

  <div class="container" v-if="events">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-outline-primary" @click="loadEvents"><i class="fas fa-sync"></i><span class="d-none d-sm-inline-block ms-1">Refresh</span></button>
        <button class="btn btn-sm btn-success ms-1" @click="markAllRead"><i class="fas fa-check"></i> Read All</button>
      </div>
      <div class="col-auto">
        <select class="form-control form-control-sm" v-model="selectedFilter" @change="loadPage(0)">
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

    <div class="row mt-2">
      <div class="col-auto">
        <!-- <p class="mb-0"><small>Click on an event to mark it as read.</small></p> -->
      </div>
      <div class="col">
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

  <div class="mt-2 events-container container" v-if="events && events.length">
      <events-list-item v-for="event in events" :key="event._id" :event="event"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
  </div>

  <div class="text-center pt-3 pb-3" v-if="events && !events.length">
      No Events.
  </div>
</div>
</template>

<script>
import EventApiService from '../../../../../services/api/event'
import LoadingSpinnerVue from '../../../../components/LoadingSpinner.vue'
import EventsListItemVue from './EventsListItem.vue'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'events-list-item': EventsListItemVue
  },
  data: function () {
    return {
      events: null,
      count: 0,
      page: 0,
      pageSize: 30,
      pageMax: 0,
      pageCurrent: 0,
      selectedFilter: 'all'
    }
  },
  mounted () {
    this.loadEvents()
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', e)
    },
    loadPage (pageNumber) {
      if (pageNumber >= 0 && pageNumber <= this.pageMax) {
        this.page = pageNumber

        this.loadEvents()
      }
    },
    async loadEvents () {
      this.events = null

      let game = this.$store.state.game

      try {
        let response = await EventApiService.getEvents(game._id, this.page, this.pageSize, this.selectedFilter)

        if (response.status === 200) {
          this.count = response.data.count
          this.events = response.data.events

          this.pageMax = Math.floor(this.count / this.pageSize)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async markAllRead () {
      try {
        let response = await EventApiService.markAllEventsAsRead(this.$store.state.game._id)

        if (response.status === 200) {
          for (let e of this.events) {
            if (e.read === false) {
              e.read = true
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    pageNumbers () {
      const pages = []
      const depth = 2

      for (let i = this.page - depth; i < this.page; i++) {
        if (i >= 0 && i <= this.pageMax) {
          pages.push(i)
        }
      }

      for (let i = this.page; i < this.page + depth; i++) {
        if (i <= this.pageMax) {
          pages.push(i)
        }
      }

      return pages
    }
  }
}
</script>

<style scoped>
.events-container {
  max-height: 600px;
  overflow: auto;
}
</style>
