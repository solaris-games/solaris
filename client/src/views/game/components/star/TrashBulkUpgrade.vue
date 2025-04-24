<template>
  <div class="position-static btn-group">
    <button class="btn btn-sm ms-1"
      :class="'btn-danger'" @click="trash()" >
      <i class="fas fa-trash"></i>
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
    onTrashed () {
      this.$emit("bulkScheduleTrashed", {
        actionId: this.action._id
      });
    },
    async trash () {
      try {
        let response = await starService.trashScheduledUpgrade(this.$store.state.game._id, this.action._id)

        if (response.status === 200) {
          this.$store.commit('gameBulkActionTrashed', this.action)

          this.$toast.default(`You scheduled Bulk Upgrade has been deleted.`)

          this.onTrashed();
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
