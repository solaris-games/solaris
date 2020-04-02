<template>
<div>
    <div class="container">
        <h3 class="pt-2">Galaxy</h3>

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
            <stars-table :game="game"/>
        </div>
        <div class="tab-pane fade" id="carriers">
            <carriers-table :game="game"/>
        </div>
        <div class="tab-pane fade" id="ships">
            <ships-table :game="game"/>
        </div>
    </div>
</div>
</template>

<script>
import StarsTableVue from './StarsTable'
import CarriersTableVue from './CarriersTable'
import ShipsTableVue from './ShipsTable'

export default {
  components: {
    'stars-table': StarsTableVue,
    'carriers-table': CarriersTableVue,
    'ships-table': ShipsTableVue
  },
  props: {
    game: Object
  }
}
</script>

<style scoped>
</style>
