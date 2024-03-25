<template>
<span v-if="userPlayer && isTechnologyEnabled && isTechnologyResearchable" @click="onViewResearchRequested" :title="researchTooltip">
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
    isTechnologyEnabled () {
      return TechnologyHelper.isTechnologyEnabled(this.$store.state.game, this.userPlayer.researchingNow)
    },
    isTechnologyResearchable () {
      return TechnologyHelper.isTechnologyResearchable(this.$store.state.game, this.userPlayer.researchingNow)
    },
    researchProgress () {
      let tech = this.userPlayer.research[this.userPlayer.researchingNow]
      let requiredProgress = TechnologyHelper.getRequiredResearchProgress(this.$store.state.game, this.userPlayer.researchingNow, tech.level)

      return Math.floor(tech.progress / requiredProgress * 100)
    },
    researchTooltip () {
      let name = TechnologyHelper.getFriendlyName(this.userPlayer.researchingNow)
      return `Researching ${name}`
    }
  }
}
</script>

<style scoped>
span {
    cursor: pointer;
}
</style>
