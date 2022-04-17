<template>
<div class="menu-page container">
    <menu-title title="Notes" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoadingNotes"/>

    <div class="row" v-if="!isLoadingNotes">
        <div class="col-12">
            <textarea v-model="notes" class="form-control" rows="15" placeholder="Write your notes here..."></textarea>
        </div>

        <div class="col"></div>
        <div class="col-auto mt-2 mb-2">
            <button class="btn btn-success" :disabled="isSavingNotes" @click="updateGameNotes">
                <i class="fas fa-save"></i> Save Notes
            </button>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import LoadingSpinner from '../../../components/LoadingSpinner'
import GameApiService from '../../../../services/api/game'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner
  },
  data () {
    return {
      isLoadingNotes: false,
      isSavingNotes: false,
      notes: ''
    }
  },
  mounted () {
    this.loadGameNotes()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    async loadGameNotes () {
      try {
        this.isLoadingNotes = true

        let response = await GameApiService.getGameNotes(this.$store.state.game._id)

        if (response.status === 200) {
          this.notes = response.data.notes
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoadingNotes = false
    },
    async updateGameNotes () {
        try {
          this.isSavingNotes = true

          let response = await GameApiService.updateGameNotes(this.$store.state.game._id, this.notes)

          if (response.status === 200) {
            this.$toasted.show(`Game notes updated.`, { type: 'success' })
          }
        } catch (err) {
          console.error(err)
        }

        this.isSavingNotes = false
    }
  }
}
</script>

<style scoped>
</style>
