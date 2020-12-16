<template>
    <span>
        <i class="fas fa-star" v-if="type === 'star' && !source"></i>
        <i class="fas fa-rocket" v-if="type === 'carrier' && !source"></i>

        <img :src="source" width="24" height="24" v-if="source" :title="specialist.name">
    </span>
</template>

<script>
import gameHelper from '../../../services/gameHelper'
export default {
  props: {
      type: String,
      specialist: Object
  },
  mounted () {

  },
  methods: {

  },
  computed: {
    source: function () {
        if (!this.specialist) {
            return null
        }
        
        let name = gameHelper.getSpecialistName(this.type, this.specialist.id)

        return require(`../../../assets/specialists/${name}.svg`)
    }
  }
}
</script>

<style scoped>
i {
    width: 24px;
    height: 24px;
    text-align: center;
    font-size: 16px;
}
</style>
