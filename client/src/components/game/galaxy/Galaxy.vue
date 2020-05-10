<template>
<div>
    <div class="container">
        <menu-title title="Galaxy" @onCloseRequested="onCloseRequested"/>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#stars">Stars</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#carriers">Carriers</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#ships">Ships</a>
            </li>
        </ul>
    </div>

    <div class="tab-content pt-2 pb-2">
        <div class="tab-pane fade show active" id="stars">
            <stars-table/>
        </div>
        <div class="tab-pane fade" id="carriers">
            <carriers-table/>
        </div>
        <div class="tab-pane fade" id="ships">
            <ships-table/>
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
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
