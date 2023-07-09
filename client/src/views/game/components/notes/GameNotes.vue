<template>
<div class="menu-page container">
    <menu-title title="Notes" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoadingNotes"/>

    <div class="row" v-if="!isLoadingNotes">
        <div class="col-12">
          <mention-box placeholder="Write your notes here" :rows="15" v-model="notes" @onSetMessageElement="onSetMessageElement" @onReplaceInMessage="onReplaceInMessage" />
        </div>

        <div class="col">
          <span :class="{'text-danger':isExceededMaxLength}">{{ noteLength }}/2000</span>
        </div>
        <div class="col-auto mt-2 mb-2">
            <button class="btn btn-success" :disabled="isSavingNotes || isExceededMaxLength" @click="updateGameNotes">
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
import MentionBox from '../shared/MentionBox'
import MentionHelper from '@/services/mentionHelper';

export default {
  components: {
    'mention-box': MentionBox,
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
    onSetMessageElement (element) {
      this.$store.commit('setMentions', {
        element,
        callbacks: {
          player: (player) => {

          },
          star: (star) => {

          }
        }
      })
    },
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
    onReplaceInMessage (data) {
      MentionHelper.useSuggestion({
        text: this.notes,
      }, this.$store.state.mentionReceivingElement, data)
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
  },
  computed: {
    noteLength () {
      if (this.notes == null) {
        return 0
      }

      return this.notes.length
    },
    isExceededMaxLength () {
      return this.noteLength > 2000
    }
  }
}
</script>

<style scoped>
</style>
