<template>
<div class="container">
    <menu-title title="Welcome" @onCloseRequested="onCloseRequested"/>

    <select-alias v-on:onAliasChanged="onAliasChanged"/>

    <enter-password v-if="isPasswordRequired" v-on:onPasswordChanged="onPasswordChanged"/>

    <form-error-list v-bind:errors="errors" class="mt-2"/>

    <loading-spinner :loading="isJoiningGame"/>

    <select-colour v-on:onJoinRequested="onJoinRequested"/>

    <share-link/>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../LoadingSpinner'
import gameService from '../../../services/api/game'
import MenuTitle from '../MenuTitle'
import FormErrorListVue from '../../FormErrorList'
import SelectAliasVue from './SelectAlias.vue'
import EnterPasswordVue from './EnterPassword.vue'
import SelectColourVue from './SelectColour.vue'
import ShareLinkVue from './ShareLink.vue'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'form-error-list': FormErrorListVue,
    'select-alias': SelectAliasVue,
    'enter-password': EnterPasswordVue,
    'select-colour': SelectColourVue,
    'share-link': ShareLinkVue
  },
  data () {
    return {
      isJoiningGame: false,
      isPasswordRequired: false,
      errors: [],
      alias: '',
      password: ''
    }
  },
  mounted () {
    this.isPasswordRequired = this.$store.state.game.settings.general.passwordRequired
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onAliasChanged (e) {
      this.alias = e
    },
    onPasswordChanged (e) {
      this.password = e
    },
    async onJoinRequested (playerId) {
      this.errors = []

      if (!this.alias) {
        this.errors.push('Alias is required.')
      }

      if (this.alias && this.alias.length < 3) {
        this.errors.push('Alias must be 3 characters or more.')
      }

      if (this.alias && this.alias.length > 24) {
        this.errors.push('Alias must less than 24 characters.')
      }

      if (this.errors.length) return

      try {
        this.isJoiningGame = true

        let response = await gameService.joinGame(this.$store.state.game._id, playerId, this.alias, this.password)

        if (response.status === 200) {
          location.reload() // It ain't pretty but it is the easiest way to refresh the game board entirely.
        }
      } catch (err) {
        if (err.response.data) {
          this.errors = err.response.data.errors
        }

        console.error(err)
      }

      this.isJoiningGame = false
    }
  }
}
</script>

<style scoped>
</style>
