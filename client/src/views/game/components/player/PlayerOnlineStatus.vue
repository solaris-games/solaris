<template>
<div v-if="player && !isOnline && onlineStatus" class="row bg-dark">
  <div class="col pt-1 pb-1 mt-0 mb-0">
    <p class="mb-0 mt-0">
      <small><i class="fas fa-eye"></i> Online {{onlineStatus}}</small>
    </p>
  </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  props: {
    player: Object
  },
  data () {
    return {
      isOnline: false,
      onlineStatus: '',
      intervalFunction: null
    }
  },
  mounted () {
    let isHiddenPlayerOnlineStatus = GameHelper.isHiddenPlayerOnlineStatus(this.$store.state.game)

    this.recalculateOnlineStatus()
    
    if (!isHiddenPlayerOnlineStatus) {
      this.intervalFunction = setInterval(this.recalculateOnlineStatus, 1000)
      this.recalculateOnlineStatus()
    }
  },
  methods: {
    recalculateOnlineStatus () {
      this.isOnline = GameHelper.isPlayerOnline(this.player)
      this.onlineStatus = GameHelper.getOnlineStatus(this.player)
    }
  }
}
</script>

<style scoped>

</style>
