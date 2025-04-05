<template>
  <a href="javascript:;" @click="pan">{{actualStarName}}<i class="fas fa-eye ms-1"></i></a>
</template>

<script>
import gameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';

export default {
  props: {
    starId: String,
    starName: String
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      actualStarName: null
    }
  },
  mounted () {
    if (this.starName != null) {
      this.actualStarName = this.starName
    } else {
      const star = gameHelper.getStarById(this.$store.state.game, this.starId)

      this.actualStarName = star ? star.name : 'Unknown'
    }
  },
  methods: {
    pan (e) {
      const star = gameHelper.getStarById(this.$store.state.game, this.starId)

      if (star) {
        this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, {
          object: star
        });
      }
    }
  }
}
</script>

<style scoped>
</style>
