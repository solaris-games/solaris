<template>
<div class="menu-page">
    <div class="container">
        <menu-title title="Galaxy" @onCloseRequested="onCloseRequested"/>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab=== 'stars'}" data-toggle="tab" href="#stars">Stars</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab === 'carriers'}" data-toggle="tab" href="#carriers">Carriers</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab === 'ships'}" data-toggle="tab" href="#ships">Ships</a>
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
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import StarsTableVue from './StarsTable'
import CarriersTableVue from './CarriersTable'
import ShipsTableVue from './ShipsTable'

export default {
  components: {
    'menu-title': MenuTitle,
    'stars-table': StarsTableVue,
    'carriers-table': CarriersTableVue,
    'ships-table': ShipsTableVue
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
</style>
