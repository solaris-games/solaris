<template>
<span v-if="userPlayer" @click="onViewResearchRequested">
    <i :class="getIcon()"></i> {{researchProgress}}%
</span>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import TechnologyHelper from '../../../../services/technologyHelper'

export default {
  methods: {
    getIcon (technologyKey) {
      return 'fas fa-' + TechnologyHelper.getIcon(this.userPlayer.researchingNow)
    },
    onViewResearchRequested (e) {
      this.$emit('onViewResearchRequested', e)
    }
  },
  computed: {
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    researchProgress () {
      let tech = this.userPlayer.research[this.userPlayer.researchingNow]
      let requiredProgress = TechnologyHelper.getRequiredResearchProgress(this.$store.state.game, this.userPlayer.researchingNow, tech.level)

      return Math.floor(tech.progress / requiredProgress * 100)
    }
  }
}
</script>

<style scoped>
span {
    cursor: pointer;
}
</style>
