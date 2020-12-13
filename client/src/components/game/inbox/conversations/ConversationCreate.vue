<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="New Conversation" @onCloseRequested="onCloseRequested"/>

    <div class="row">
      <form class="col-12 pb-2" @submit="createConversation">
        <div class="col-12">
            <form-error-list v-bind:errors="errors"/>
        </div>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" class="form-control" id="name" placeholder="Enter a name for the group" v-model="name">
        </div>

        <div class="form-group">
          <label for="participants">Participants</label>
          <select multiple class="form-control" id="participants" v-model="participants">
            <option v-for="participant in possibleParticipants" :key="participant._id" :value="participant._id">
              {{participant.alias}}
            </option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary float-right" :disabled="isLoading">
          <i class="fas fa-comments"></i>
          Create
        </button>
      </form>
    </div>
  </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import ConversationApiService from '../../../../services/api/conversation'
import MenuTitle from '../../MenuTitle'
import LoadingSpinnerVue from '../../../../components/LoadingSpinner'
import FormErrorList from '../../../../components/FormErrorList'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinnerVue,
    'form-error-list': FormErrorList
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
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
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
          console.log(response.data)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    }
  },
  computed: {

  }
}
</script>

<style scoped>

</style>
