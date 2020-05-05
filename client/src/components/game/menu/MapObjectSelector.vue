<template>
    <div>
        <table class="table">
            <tbody>
                <tr v-for="mapObject in mapObjects" :key="mapObject._id">
                    <td :style="{'width': '8px', 'background-color': getFriendlyColour(mapObject)}"></td>
                    <td v-if="mapObject.type === 'star'" class="col-auto">
                        <h5><i class="fas fa-star"></i></h5>
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="col-auto">
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
                        <button v-if="mapObject.type === 'carrier'" type="button" class="btn btn-primary ml-1" @click="onEditWaypointRequested(mapObject)"><i class="fas fa-plus"></i></button>
                        <button type="button" class="btn btn-primary ml-1" @click="onViewObjectRequested(mapObject)">View</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    game: Object,
    mapObjects: Array
  },
  methods: {
    getObjectOwningPlayer (mapObject) {
        switch (mapObject.type) {
            case 'star': 
                return gameHelper.getStarOwningPlayer(this.game, mapObject.data)
                break
            case 'carrier': 
                return gameHelper.getCarrierOwningPlayer(this.game, mapObject.data)
                break
        }
    },
    getFriendlyColour (mapObject) {
        let owningPlayer;

        switch (mapObject.type) {
            case 'star': 
                owningPlayer = gameHelper.getStarOwningPlayer(this.game, mapObject.data)
                break
            case 'carrier': 
                owningPlayer = gameHelper.getCarrierOwningPlayer(this.game, mapObject.data)
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
                this.$emit('onOpenStarDetailRequested', mapObject.data) 
                break
            case 'carrier': 
                this.$emit('onOpenCarrierDetailRequested', mapObject.data) 
                break
        }
    },
    onEditWaypointRequested (mapObject) {
        this.$emit('onEditWaypointRequested', mapObject.data)
    }
  }
}
</script>

<style scoped>
td {
  vertical-align: middle; /* TODO: Middle align all td everywhere in the app? */
}
</style>
