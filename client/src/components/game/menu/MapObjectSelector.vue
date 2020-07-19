<template>
    <div class="table-responsive">
        <table class="table">
            <tbody>
                <tr v-for="mapObject in mapObjects" :key="mapObject._id">
                    <td :style="{'padding': '0', 'width': '8px', 'background-color': getFriendlyColour(mapObject)}"></td>
                    <td v-if="mapObject.type === 'star'" class="col-auto text-center">
                        <h5><i class="fas fa-star"></i></h5>
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="col-auto text-center">
                        <h5><i class="fas fa-rocket"></i></h5>
                    </td>
                    <td v-if="mapObject.type === 'star'" class="bg-secondary text-center">
                        <span>{{mapObject.data.garrison}}</span>
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="bg-secondary text-center">
                        <span>{{mapObject.data.ships}}</span>
                    </td>
                    <td>
                        <span>{{mapObject.data.name}}</span>
                    </td>
                    <td class="text-right">
                        <!-- <button type="button" class="btn btn-primary"><i class="fas fa-chevron-up"></i></button>
                        <button type="button" class="btn btn-primary"><i class="fas fa-chevron-down"></i></button>
                        <button v-if="mapObject.type === 'star' && mapObject.data.garrison" type="button" class="btn btn-primary"><i class="fas fa-rocket"></i></button> -->
                        <button v-if="mapObject.type === 'carrier' && userOwnsObject(mapObject) && !getObjectOwningPlayer(mapObject).defeated" type="button" class="btn btn-primary ml-1" @click="onEditWaypointsRequested(mapObject)"><i class="fas fa-plus"></i></button>
                        <button type="button" class="btn btn-primary ml-1" @click="onViewObjectRequested(mapObject)">View</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'
import gameContainer from '../../../game/container'

export default {
  props: {
    mapObjects: Array
  },
  methods: {
    userOwnsObject (mapObject) {
        let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)

        switch (mapObject.type) {
            case 'star': 
                return gameHelper.getStarOwningPlayer(this.$store.state.game, mapObject.data)._id === userPlayer._id
                break
            case 'carrier': 
                return gameHelper.getCarrierOwningPlayer(this.$store.state.game, mapObject.data)._id === userPlayer._id
                break
        }
    },
    getObjectOwningPlayer (mapObject) {
        switch (mapObject.type) {
            case 'star': 
                return gameHelper.getStarOwningPlayer(this.$store.state.game, mapObject.data)
                break
            case 'carrier': 
                return gameHelper.getCarrierOwningPlayer(this.$store.state.game, mapObject.data)
                break
        }
    },
    getFriendlyColour (mapObject) {
        let owningPlayer;

        switch (mapObject.type) {
            case 'star': 
                owningPlayer = gameHelper.getStarOwningPlayer(this.$store.state.game, mapObject.data)
                break
            case 'carrier': 
                owningPlayer = gameHelper.getCarrierOwningPlayer(this.$store.state.game, mapObject.data)
                break
        }

        if (!owningPlayer) {
            return ''
        }

        return gameHelper.getFriendlyColour(owningPlayer.colour.value)
    },
    onViewObjectRequested (mapObject) {
        switch (mapObject.type) {
            case 'star':
                gameContainer.map.clickStar(mapObject.data._id)
                this.$emit('onOpenStarDetailRequested', mapObject.data._id) 
                break
            case 'carrier': 
                this.$emit('onOpenCarrierDetailRequested', mapObject.data) 
                break
        }
    },
    onEditWaypointsRequested (mapObject) {
        this.$emit('onEditWaypointsRequested', mapObject.data)
    }
  }
}
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>
