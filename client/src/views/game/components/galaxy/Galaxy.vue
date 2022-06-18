<template>
<div class="menu-page">
    <div class="container">
        <menu-title title="Galaxy" @onCloseRequested="onCloseRequested"/>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab=== 'stars'}" data-bs-toggle="tab" href="#stars">Stars</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab === 'carriers'}" data-bs-toggle="tab" href="#carriers">Carriers</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab === 'ships'}" data-bs-toggle="tab" href="#ships">Ships</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab === 'capitals'}" data-bs-toggle="tab" href="#capitals">Capitals</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab === 'naturalResources'}" data-bs-toggle="tab" href="#naturalResources">Resources</a>
            </li>
        </ul>
    </div>

    <div class="tab-content pt-2 pb-2">
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'stars'}" id="stars">
            <stars-table
              @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </div>
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'carriers'}" id="carriers">
            <carriers-table
              @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
        </div>
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'ships'}" id="ships">
            <ships-table
              @onOpenStarDetailRequested="onOpenStarDetailRequested"
              @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
        </div>
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'capitals'}" id="capitals">
            <capitals-table
              @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </div>
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'naturalResources'}" id="naturalResources">
            <natural-resources-table
              @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import StarsTableVue from './StarsTable'
import CarriersTableVue from './CarriersTable'
import ShipsTableVue from './ShipsTable'
import CapitalsTableVue from './CapitalsTable'
import NaturalResourcesTableVue from './NaturalResourcesTable'

export default {
  components: {
    'menu-title': MenuTitle,
    'stars-table': StarsTableVue,
    'carriers-table': CarriersTableVue,
    'ships-table': ShipsTableVue,
    'capitals-table': CapitalsTableVue,
    'natural-resources-table': NaturalResourcesTableVue
  },
  props: {
    'tab': String
  },
  data () {
    return {
      activeTab: null
    }
  },
  mounted () {
    this.activeTab = this.tab || 'stars'
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', e)
    }
  }
}
</script>

<style scoped>
.nav-link {
  padding: 0.5rem 1.5rem;
}
</style>
