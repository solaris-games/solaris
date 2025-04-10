<template>
  <div class="menu-page container">
    <menu-title title="Notes" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoadingNotes"/>

    <div class="row" v-show="!isLoadingNotes">
      <div class="col-12">
        <p v-show="!isEditing" ref="notesReadonlyElement" class="notes-readonly"></p>
        <mention-box v-if="isEditing" placeholder="Write your notes here" :rows="15" v-model="notes"
                     @onSetMessageElement="onSetMessageElement" @onReplaceInMessage="onReplaceInMessage"
                     @onFinish="updateGameNotes"/>
      </div>

      <div class="col">
        <span v-if="isEditing" :class="{'text-danger':isExceededMaxLength}">{{ noteLength }}/2000</span>
      </div>
      <div class="col-auto mt-2 mb-2">
        <button v-if="!isEditing" class="btn btn-primary" @click="beginEditing">
          <i class="fas fa-edit"></i> Edit Notes
        </button>
        <button v-if="isEditing" class="btn btn-success" :disabled="isSavingNotes || isExceededMaxLength"
                @click="updateGameNotes">
          <i class="fas fa-save"></i> Save Notes
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import GameApiService from '../../../../services/api/game'
import MentionBox from '../shared/MentionBox.vue'
import MentionHelper from '@/services/mentionHelper';
import GameHelper from "@/services/gameHelper";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "@/eventBus";
import { inject } from 'vue';

export default {
  components: {
    'mention-box': MentionBox,
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner
  },
  data() {
    return {
      isLoadingNotes: false,
      isSavingNotes: false,
      isEditing: false,
      readonlyNotes: '',
      notes: ''
    }
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  mounted() {
    this.loadGameNotes()
  },
  unmounted() {
    this.$store.commit('resetMentions')
  },
  methods: {
    beginEditing() {
      this.isEditing = true
      this.notes = MentionHelper.makeMentionsEditable(this.$store.state.game, this.readonlyNotes);
    },
    onSetMessageElement(element) {
      this.$store.commit('setMentions', {
        element,
        callbacks: {
          player: (player) => {
            this.notes = MentionHelper.addMention(this.notes, this.$store.state.mentionReceivingElement, 'player', player.alias)
          },
          star: (star) => {
            this.notes = MentionHelper.addMention(this.notes, this.$store.state.mentionReceivingElement, 'star', star.name)
          }
        }
      })
    },
    onCloseRequested(e) {
      this.$emit('onCloseRequested', e)
    },
    async loadGameNotes() {
      try {
        this.isLoadingNotes = true

        let response = await GameApiService.getGameNotes(this.$store.state.game._id)

        if (response.status === 200) {
          this.setReadonlyNotes(response.data.notes)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoadingNotes = false
    },
    onReplaceInMessage(data) {
      this.notes = MentionHelper.useSuggestion(this.notes, this.$store.state.mentionReceivingElement, data)
    },
    async updateGameNotes() {
      try {
        this.isEditing = false
        this.isSavingNotes = true

        const newNotes = MentionHelper.makeMentionsStatic(this.$store.state.game, this.notes)
        let response = await GameApiService.updateGameNotes(this.$store.state.game._id, newNotes)

        if (response.status === 200) {
          this.setReadonlyNotes(newNotes)
          this.$toast.success(`Game notes updated.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isSavingNotes = false
    },
    setReadonlyNotes(notes) {
      MentionHelper.resetMessageElement(this.$refs.notesReadonlyElement)
      this.readonlyNotes = notes || ''
      MentionHelper.renderMessageWithMentionsAndLinks(this.$refs.notesReadonlyElement, this.readonlyNotes, this.onStarClicked, this.onPlayerClicked);
    },
    panToStar (id) {
      const star = GameHelper.getStarById(this.$store.state.game, id)

      if (star) {
        this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star });
      } else {
        this.$toast.error(`The location of the star is unknown.`)
      }
    },
    onStarClicked(id) {
      this.panToStar(id)
    },
    onPlayerClicked(id) {
      this.$emit('onOpenPlayerDetailRequested', id)
    }
  },
  computed: {
    noteLength() {
      if (this.notes == null) {
        return 0
      }

      const staticText = MentionHelper.makeMentionsStatic(this.$store.state.game, this.notes)

      return staticText.length
    },
    isExceededMaxLength() {
      return this.noteLength > 2000
    }
  }
}
</script>

<style scoped>
.notes-readonly {
  padding: 6px 12px;
  letter-spacing: normal;
  white-space: pre-wrap;
}
</style>
