<template>
<div class="menu-page container">
    <menu-title :title="'Welcome to ' + game.settings.general.name" @onCloseRequested="onCloseRequested">
    </menu-title>

    <div class="row bg-info" v-if="game.settings.general.flux" title="This Game's Flux">
      <div class="col text-center">
        <!-- <p class="mt-2 mb-2"><small><i class="fas fa-dice-d20 me-1"></i><strong>{{game.settings.general.flux.name}}</strong> - {{game.settings.general.flux.description}} <help-tooltip v-if="game.settings.general.flux.tooltip" :tooltip="game.settings.general.flux.tooltip"/></small></p> -->
        <p class="mt-2 mb-2"><small><i class="fas fa-dice-d20 me-1"></i>{{game.settings.general.flux.description}} <help-tooltip v-if="game.settings.general.flux.tooltip" :tooltip="game.settings.general.flux.tooltip"/></small></p>
      </div>
    </div>

    <select-alias v-on:onAliasChanged="onAliasChanged" v-on:onAvatarChanged="onAvatarChanged" :isAnonymousGame="isAnonymousGame" />

    <enter-password v-if="isPasswordRequired" v-on:onPasswordChanged="onPasswordChanged"/>

    <form-error-list v-bind:errors="errors" class="mt-2"/>

    <loading-spinner :loading="isJoiningGame"/>

    <select-colour v-if="!isJoiningGame" v-on:onJoinRequested="onJoinRequested" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <new-player-message />

    <share-link message="Invite your friends and take on the Galaxy together!"/>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner.vue'
import gameService from '../../../../services/api/game'
import MenuTitle from '../MenuTitle.vue'
import FormErrorListVue from '../../../components/FormErrorList.vue'
import SelectAliasVue from './SelectAlias.vue'
import EnterPasswordVue from './EnterPassword.vue'
import SelectColourVue from './SelectColour.vue'
import NewPlayerMessageVue from './NewPlayerMessage.vue'
import ShareLinkVue from './ShareLink.vue'
import HelpTooltip from "../../../components/HelpTooltip.vue"
import gameHelper from "@/services/gameHelper";

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'form-error-list': FormErrorListVue,
    'select-alias': SelectAliasVue,
    'enter-password': EnterPasswordVue,
    'select-colour': SelectColourVue,
    'new-player-message': NewPlayerMessageVue,
    'share-link': ShareLinkVue,
    'help-tooltip': HelpTooltip,
  },
  data () {
    return {
      isJoiningGame: false,
      isPasswordRequired: false,
      errors: [],
      avatar: null,
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
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onViewSettingsRequested (e) {
      this.$emit('onViewSettingsRequested', e)
    },
    onAvatarChanged (e) {
      this.avatar = e
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

      if (!this.avatar) {
        this.errors.push('Please select an avatar.')
      }

      if (this.errors.length) return

      try {
        this.isJoiningGame = true

        let response = await gameService.joinGame(this.$store.state.game._id, playerId, this.alias, this.avatar.id, this.password)

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
  },
  computed: {
    game () {
      return this.$store.state.game
    },
    isAnonymousGame() {
      return gameHelper.isExtraAnonymity(this.game);
    }
  }
}
</script>

<style scoped>
</style>
