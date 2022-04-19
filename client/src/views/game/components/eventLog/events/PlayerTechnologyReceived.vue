<template>
<div v-if="player">
  <p>
      You have received <span class="text-warning">Level {{event.data.technology.level}} {{getTechnologyFriendlyName(event.data.technology.name)}}</span> from <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>.
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../../services/gameHelper'
import TechnologyHelper from '../../../../../services/technologyHelper'

export default {
  components: {

  },
  props: {
    event: Object
  },
  data () {
    return {
      player: null
    }
  },
  mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.event.data.fromPlayerId)
  },
  methods: {
    getTechnologyFriendlyName (key) {
      return TechnologyHelper.getFriendlyName(key)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.player._id)
    }
  }
}
</script>

<style scoped>
</style>
