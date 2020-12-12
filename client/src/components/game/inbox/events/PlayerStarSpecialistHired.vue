<template>
<div v-if="star">
  <p>
      You hired the specialist <span class="text-warning">{{event.data.specialistName}}</span> at the star <a href="javascript:;" @click="onOpenStarDetailRequested">{{star.name}}</a>.
  </p>
  <p>
    <small><em>{{event.data.specialistDescription}}</em></small>
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  props: {
    event: Object
  },
  data () {
    return {
      star: null
    }
  },
  mounted () {
    this.star = GameHelper.getStarById(this.$store.state.game, this.event.data.starId)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    }
  }
}
</script>

<style scoped>
</style>
