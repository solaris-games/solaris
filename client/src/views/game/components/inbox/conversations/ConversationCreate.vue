<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="New Conversation" @onCloseRequested="onCloseRequested">
      <button class="btn btn-sm btn-outline-primary" @click="onOpenInboxRequested" title="Back to Inbox"><i class="fas fa-inbox"></i></button>
    </menu-title>

    <div class="row">
      <form class="col-12 pb-2" @submit="createConversation">
        <div class="col-12">
            <form-error-list v-bind:errors="errors"/>
        </div>
        <div class="mb-2">
          <label for="name">Name</label>
          <input type="text" class="form-control" id="name" placeholder="Enter a name for the group" v-model="name">
        </div>

        <div class="mb-2">
          <label for="participants">Participants</label>
          <select multiple class="form-control" id="participants" v-model="participants">
            <option v-for="participant in possibleParticipants" :key="participant._id" :value="participant._id">
              {{participant.alias}}
            </option>
          </select>
        </div>

        <button type="submit" class="btn btn-success float-end" :disabled="isLoading">
          <i class="fas fa-comments"></i>
          Create Conversation
        </button>
      </form>
    </div>
  </div>
</div>
</template>

<script>
import eventBus from '../../../../../eventBus'
import GameHelper from '../../../../../services/gameHelper'
import ConversationApiService from '../../../../../services/api/conversation'
import MenuTitle from '../../MenuTitle.vue'
import LoadingSpinnerVue from '../../../../components/LoadingSpinner.vue'
import FormErrorList from '../../../../components/FormErrorList.vue'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinnerVue,
    'form-error-list': FormErrorList
  },
  props: {
    participantIds: Array
  },
  data () {
    return {
      isLoading: false,
      errors: [],
      name: '',
      participants: [],
      possibleParticipants: []
    }
  },
  mounted () {
    let userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

    this.possibleParticipants = this.$store.state.game.galaxy.players.filter(p => p._id !== userPlayer._id)

    // Pre-select any participants passed into the props.
    if (this.participantIds && this.participantIds.length) {
      this.participants = this.participantIds
    }
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenInboxRequested (e) {
      eventBus.$emit('onOpenInboxRequested', e)
    },
    async createConversation (e) {
      this.errors = []

      if (!this.name.length) {
        this.errors.push('Name is required.')
      }

      if (!this.participants.length) {
        this.errors.push('Must have at least one participant selected.')
      }

      e.preventDefault()

      if (this.errors.length) return

      this.isLoading = true

      try {
        let response = await ConversationApiService.create(this.$store.state.game._id, this.name, this.participants)

        if (response.status === 200) {
          eventBus.$emit('onViewConversationRequested', {
            conversationId: response.data._id
          })
        }
      } catch (err) {
        console.error(err)

        if (err.response.data.errors) {
          this.errors = err.response.data.errors
        }
      }

      this.isLoading = false
    }
  },
  computed: {

  }
}
</script>

<style scoped>
select {
  min-height: 200px;
}
</style>
