<template>
  <div class="position-static btn-group">
    <button class="btn btn-sm ms-1"
      :class="{'btn-success':action.repeat,'btn-danger':!action.repeat}" @click="toggleRepeat()" >
      <i class="fas fa-sync"></i>
    </button>
  </div>
</template>

<script>
import starService from '../../../../services/api/star'

export default {
  components: {

  },
  props: {
    action: Object,
  },
  methods: {
    async toggleRepeat () {
      try {
        let response = await starService.bulkScheduleRepeatChanged(this.$store.state.game._id, this.action._id)

        if (response.status === 200) {
          this.action.repeat = !this.action.repeat

          if (this.action.repeat) {
            this.$toast.default(`Your Bulk Upgrade will be repeated every cycle.`)
          } else {
            this.$toast.default(`Your Bulk Upgrade will only be executed on tick ${this.action.tick}.`)
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  },
  computed: {

  }
}
</script>

<style scoped>
</style>
