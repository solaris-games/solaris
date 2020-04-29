<template>
<div class="container">
    <menu-title title="Welcome" @onCloseRequested="onCloseRequested"/>

    <select-alias v-on:onAliasChanged="onAliasChanged"/>

    <form-error-list v-bind:errors="errors" class="mt-2"/>

    <loading-spinner :loading="isJoiningGame"/>

    <select-colour :game="game" v-on:onJoinRequested="onJoinRequested"/>

    <div class="text-center pb-2">
        <p>Invite your friends and take on the Galaxy together!</p>

        <p class="mb-0">Send them this address!</p>
        <p class="text-info"><i>{{protocol}}//{{domain}}{{$route.fullPath}}</i></p>
    </div>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../LoadingSpinner'
import gameService from '../../../services/api/game'
import MenuTitle from '../MenuTitle'
import FormErrorListVue from '../../FormErrorList'
import SelectAliasVue from './SelectAlias.vue'
import SelectColourVue from './SelectColour.vue'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'form-error-list': FormErrorListVue,
    'select-alias': SelectAliasVue,
    'select-colour': SelectColourVue
  },
  props: {
    game: Object
  },
  data () {
    return {
      isJoiningGame: false,
      domain: '',
      errors: [],
      alias: ''
    }
  },
  mounted () {
    this.protocol = window.location.protocol
    this.domain = window.location.host
  },
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    },
    onAliasChanged (e) {
      this.alias = e
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

        let response = await gameService.joinGame(this.game._id, playerId, this.alias)

        if (response.status === 200) {
          location.reload() // It ain't pretty but it is the easiest way to refresh the game board entirely.
        }
      } catch (err) {
        console.error(err)
      }

      this.isJoiningGame = false
    }
  }
}
</script>

<style scoped>
</style>
