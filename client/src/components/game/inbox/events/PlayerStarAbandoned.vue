<template>
<div>
  <p>
      You have abandoned the star <a href="javascript:;" @click="onOpenStarDetailRequested">{{star.name}}</a>.
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  components: {
      
  },
  props: {
    event: Object
  },
  data () {
    return {
      star: null
    }
  },
  mounted () {
    this.star = GameHelper.getStarById(this.event.data.starId)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.star)
    }
  }
}
</script>

<style scoped>
</style>
