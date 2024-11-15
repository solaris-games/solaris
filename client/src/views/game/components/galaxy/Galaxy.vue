<template>
<div class="menu-page">
    <div class="container">
        <menu-title title="Galaxy" @onCloseRequested="onCloseRequested"/>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab=== 'empires'}" data-bs-toggle="tab" href="#empires">Empires</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab=== 'stars'}" data-bs-toggle="tab" href="#stars">Stars</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab=== 'starTypes'}" data-bs-toggle="tab" href="#starTypes">Star Types</a>
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
            <li class="nav-item">
                <a class="nav-link" :class="{'active':activeTab === 'technology'}" data-bs-toggle="tab" href="#technology">Technology</a>
            </li>
        </ul>
    </div>

    <div class="tab-content pt-2 pb-2">
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'empires'}" id="empires">
            <empires-table
              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
        </div>
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'stars'}" id="stars">
            <stars-table
              @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </div>
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'starTypes'}" id="starTypes">
            <star-types-table
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
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'technology'}" id="technology">
            <technology-table
              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import StarsTableVue from './StarsTable.vue'
import StarTypesTableVue from './StarTypesTable.vue'
import CarriersTableVue from './CarriersTable.vue'
import ShipsTableVue from './ShipsTable.vue'
import CapitalsTableVue from './CapitalsTable.vue'
import NaturalResourcesTableVue from './NaturalResourcesTable.vue'
import EmpiresTableVue from './EmpiresTable.vue'
import TechnologyTableVue from './TechnologyTable.vue'

export default {
  components: {
    'menu-title': MenuTitle,
    'stars-table': StarsTableVue,
    'star-types-table': StarTypesTableVue,
    'carriers-table': CarriersTableVue,
    'ships-table': ShipsTableVue,
    'capitals-table': CapitalsTableVue,
    'natural-resources-table': NaturalResourcesTableVue,
    'empires-table': EmpiresTableVue,
    'technology-table': TechnologyTableVue
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
    this.activeTab = this.tab || 'empires'
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
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    }
  }
}
</script>

<style scoped>
.nav-item {
    flex-basis: 25%;
}
.nav-link {
  padding: 0.5rem 0.2rem;
  text-align: center;
}
</style>
