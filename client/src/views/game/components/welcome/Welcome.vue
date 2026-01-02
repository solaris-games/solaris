<template>
<div class="menu-page container">
    <menu-title :title="'Welcome to ' + game.settings.general.name" @onCloseRequested="() => emit('onCloseRequested')">
    </menu-title>

    <div class="row bg-info" v-if="game.settings.general.flux" title="This Game's Flux">
      <div class="col text-center">
        <p class="mt-2 mb-2"><small><i class="fas fa-dice-d20 me-1"></i>{{game.settings.general.flux.description}}</small></p>
      </div>
    </div>

    <select-alias v-on:onAliasChanged="onAliasChanged" v-on:onAvatarChanged="onAvatarChanged" :isAnonymousGame="isAnonymousGame" />

    <enter-password v-if="isPasswordRequired" v-on:onPasswordChanged="onPasswordChanged"/>

    <div class="row bg-dark" v-if="isJoinRandomSlot && !isJoiningGame">
      <div class="col text-center">
        <span>You will be placed in a random slot</span>

        <button class="btn btn-success m-4 btn-lg" @click="joinRandomSlot()">Join</button>
      </div>
    </div>

    <form-error-list v-bind:errors="errors" class="mt-2"/>

    <loading-spinner :loading="isJoiningGame"/>

    <player-leaderboard v-if="isJoinRandomSlot" @onOpenPlayerDetailRequested="(e) => emit('onOpenPlayerDetailRequested', e)" />

    <select-colour v-if="!isJoinRandomSlot && !isJoiningGame" v-on:onJoinRequested="onJoinRequested" @onOpenPlayerDetailRequested="(e) => emit('onOpenPlayerDetailRequested', e)"/>

    <new-player-message />

    <share-link message="Invite your friends and take on the Galaxy together!"/>
</div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import MenuTitle from '../MenuTitle.vue'
import FormErrorList from '../../../components/FormErrorList.vue'
import SelectAlias from './SelectAlias.vue'
import EnterPassword from './EnterPassword.vue'
import SelectColour from './SelectColour.vue'
import NewPlayerMessage from './NewPlayerMessage.vue'
import ShareLink from './ShareLink.vue'
import gameHelper from "@/services/gameHelper";
import { ref, computed, inject, type Ref } from 'vue';
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {join} from "@/services/typedapi/game";
import PlayerLeaderboard from "@/views/game/components/leaderboard/PlayerLeaderboard.vue";
import {useGameServices} from "@/util/gameServices";

const httpClient = inject(httpInjectionKey)!;

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const isJoiningGame = ref(false);
const errors: Ref<string[]> = ref([]);
const avatar = ref<number | null>(null);
const alias = ref('');
const password = ref('');

const serviceProvider = useGameServices();

const store = useStore()
const game = computed(() => store.state.game as Game);
const isAnonymousGame = computed(() => serviceProvider.gameTypeService.isAnonymousGameDuringGame(game.value));
const isPasswordRequired = computed(() => game.value.settings.general.passwordRequired);
const isJoinRandomSlot = computed(() => game.value.settings.general.joinRandomSlot === 'enabled');

const onAliasChanged = (newAlias: string) => {
  alias.value = newAlias;
};

const onAvatarChanged = (newAvatar: number) => {
  avatar.value = newAvatar;
};

const onPasswordChanged = (newPassword: string) => {
  password.value = newPassword;
};

const onJoinRequested = async (playerId: string | undefined) => {
  errors.value = [];

  if (!alias.value) {
    errors.value.push('Alias is required.')
  }

  if (avatar.value === null) {
    errors.value.push('Please select an avatar.')
  }

  if (errors.value.length) {
    return;
  }

  isJoiningGame.value = true;

  const response = await join(httpClient)(game.value._id, playerId, alias.value, avatar.value!, password.value);

  if (isOk(response)) {
    location.reload(); // todo: do we really need to do this?
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isJoiningGame.value = false;
};


const joinRandomSlot = async () => {
  await onJoinRequested(undefined);
};
</script>

<style scoped>
</style>
