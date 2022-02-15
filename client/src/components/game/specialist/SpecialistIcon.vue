<template>
    <span>
        <i class="fas" :class="'fa-' + defaultIcon" v-if="!hideDefaultIcon && !source"></i>

        <img :src="source" width="24" height="24" v-if="source" :title="specialist.name">
    </span>
</template>

<script>
import gameHelper from '../../../services/gameHelper'
export default {
  props: {
      type: String,
      defaultIcon: String,
      hideDefaultIcon: Boolean,
      specialist: Object,
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
        
        return require(`../../../assets/specialists/${this.specialist.key}.svg`)
    }
  }
}
</script>

<style scoped>
i {
    width: 24px;
    height: 24px;
    text-align: left;
    font-size: 16px;
}
</style>
