<template>
  <span>
    <i v-if="diplomaticStatus && diplomaticStatus.actualStatus === 'allies'" class="fas fa-handshake" title="This player is an ally"></i>
    <i v-if="diplomaticStatus && diplomaticStatus.actualStatus === 'neutral'" class="fas fa-dove" title="This player is neutral"></i>
    <i v-if="diplomaticStatus && diplomaticStatus.actualStatus === 'enemies'" class="fas fa-crosshairs" title="This player is an enemy"></i>
  </span>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import DiplomacyApiService from '../../../../services/api/diplomacy'

export default {
  props: {
    toPlayerId: String
  },
  data () {
    return {
      diplomaticStatus: null
    }
  },
  async mounted () {
    await this.loadDiplomaticStatus()
  },
  methods: {
    async loadDiplomaticStatus () {
      const userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

      if (!userPlayer || this.toPlayerId === userPlayer._id) {
        return
      }

      try {
        const response = await DiplomacyApiService.getDiplomaticStatusToPlayer(this.$store.state.game._id, this.toPlayerId)

        if (response.status === 200) {
          this.diplomaticStatus = response.data
        }
      } catch (err) {
        console.error(err)

        this.diplomaticStatus = null
      }
    }
  }
}
</script>

<style scoped>

</style>
