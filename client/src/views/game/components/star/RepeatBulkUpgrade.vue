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
import GameHelper from '../../../../services/gameHelper'
//import GameContainer from '../../../../game/container'

export default {
  components: {

  },
  props: {
    action: Object,
  },
  methods: {
    triggerChanged () {
      this.$emit("bulkScheduleRepeatChanged", { 
        actionId: this.action._id
      });
      action = GameHelper.getActionById(this.$store.state.game, getUserPlayer()._id, this.action._id);
      //GameContainer.reloadAction(action); This wouldn't be required for an action which is only in the menu?!
    },
    async toggleRepeat () {
      try {
        let response = await starService.bulkScheduleRepeatChanged(this.$store.state.game._id, this.player._id, this.action._id)
        
        if (response.status === 200) {
          this.action.repeat = !this.action.repeat

          if (this.star.repeat) {
            this.$toasted.show(`Your Bulk Upgrade will now be repeated every cycle.`)
          } else {
            this.$toasted.show(`Your Bulk Upgrade will not be executed once on tick ${this.action.tick}.`)
          }
          
          this.triggerChanged();
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
