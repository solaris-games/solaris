<template>
  <div class="menu-page container pb-2">
    <menu-title title="Leaderboard" @onCloseRequested="onCloseRequested">
      <button title="View Settings" tag="button" class="btn btn-sm btn-outline-primary"
        @click="onViewSettingsRequested"><i class="fas fa-cog"></i></button>
    </menu-title>

    <div class="row">
      <div class="col">
        <h4 class="text-center mt-2">{{ game.settings.general.name }}</h4>
      </div>
    </div>

    <div class="row" v-if="!game.state.endDate && almostAfkReminder">
      <div class="col text-center">
        <p class="mt-2 mb-2 text-danger">You have missed the last {{ userPlayer?.missedTurns }} turn(s). Please
          mark your turn as completed or you will be marked afk.</p>
      </div>
    </div>

    <div class="row bg-info" v-if="!game.state.endDate && game.settings.general.flux" title="This Game's Flux">
      <div class="col text-center">
        <p class="mt-2 mb-2"><small><i class="fas fa-dice-d20 me-1"></i>{{ game.settings.general.flux.description }}
            <help-tooltip v-if="game.settings.general.flux?.description" :tooltip="game.settings.general.flux.description" />
          </small></p>
      </div>
    </div>

    <win-condition :game="game" v-if="!game.state.endDate" />

    <div class="row bg-dark" v-if="!game.state.endDate">
      <div class="col text-center pt-2">
        <p class="mb-2">Galactic Cycle {{ game.state.productionTick }} - Tick {{ game.state.tick }}</p>
        <p class="text-warning" v-if="isDarkModeExtra && userPlayer != null"><small>The leaderboard is based on
            your scanning range.</small></p>
      </div>
    </div>

    <div class="row" v-if="game.state.startDate && !game.state.endDate">
      <div class="col text-center pt-2 pb-0">
        <p class="pb-0 mb-2">{{ timeRemaining }}</p>
      </div>
    </div>

    <div class="row" v-if="!game.state.endDate && game.state.readyToQuitCount">
      <div class="col text-center pt-2">
        <p>{{ game.state.readyToQuitCount }} of {{ game.state.players }} active players are ready to quit.</p>
      </div>
    </div>

    <div class="row bg-success" v-if="game.state.endDate">
      <div class="col text-center pt-2">
        <h3>Game Over</h3>
        <p v-if="!isTeamConquest">The winner is <b>{{ getWinnerAlias() }}</b>!</p>
        <p v-if="isTeamConquest">The winning team is <b>{{ getWinningTeam() }}</b></p>
      </div>
    </div>

    <div v-if="isTeamConquest">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" :class="{ 'active': activeTab === 'team' }" data-bs-toggle="tab" href="#team">Team</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ 'active': activeTab === 'player' }" data-bs-toggle="tab"
            href="#player">Player</a>
        </li>
      </ul>

      <div class="tab-content pt-2 pb-2">
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'team' }" id="team">
          <team-leaderboard @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
        </div>
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'player' }" id="player">
          <player-leaderboard @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
        </div>
      </div>
    </div>

    <player-leaderboard v-if="!isTeamConquest" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />

    <new-player-message />

    <share-link v-if="!game.state.startDate" message="Invite your friends and take on the Galaxy together!" />
    <share-link v-if="game.state.startDate && !game.state.endDate"
      message="Share this game with your friends to spectate, no sign-up required!" />
    <share-link v-if="game.state.endDate" message="Share this game with your friends, no sign-up required!" />

    <div class="row" v-if="userPlayer != null && !game.state.endDate">
      <div class="col text-end pe-2">
        <modalButton v-if="!game.state.startDate" :disabled="isQuittingGame" modalName="quitGameModal"
          classText="btn btn-sm btn-danger">
          <i class="fas fa-sign-out-alt"></i> Quit Game
        </modalButton>
        <button v-if="canReadyToQuit && !userPlayer.defeated && !userPlayer.readyToQuit"
          @click="confirmReadyToQuit(userPlayer)" class="btn btn-sm btn-outline-warning me-1">
          <i class="fas fa-times"></i> Declare Ready to Quit
        </button>
        <button v-if="canReadyToQuit && !userPlayer.defeated && userPlayer.readyToQuit"
          @click="unconfirmReadyToQuit(userPlayer)" class="btn btn-sm btn-success me-1">
          <i class="fas fa-check"></i> Ready to Quit
        </button>
        <concede-defeat-button />
      </div>
    </div>

    <!-- Modals -->
    <dialogModal modalName="quitGameModal" titleText="Quit Game" cancelText="No" confirmText="Yes"
      @onConfirm="quitGame">
      <p>Are you sure you want to quit this game? Your position will be opened again and you will <b>not</b> be able to
        rejoin.</p>
    </dialogModal>
  </div>
</template>

<script setup lang="ts">
import router from '../../../../router'
import gameService from '../../../../services/api/game'
import ModalButton from '../../../components/modal/ModalButton.vue'
import DialogModal from '../../../components/modal/DialogModal.vue'
import GameHelper from '../../../../services/gameHelper'
import MenuTitle from '../MenuTitle.vue'
import AudioService from '../../../../game/audio'
import NewPlayerMessage from '../welcome/NewPlayerMessage.vue'
import ShareLink from '../welcome/ShareLink.vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import ConcedeDefeatButton from './ConcedeDefeatButton.vue'
import PlayerLeaderboard from './PlayerLeaderboard.vue';
import TeamLeaderboard from './TeamLeaderboard.vue';
import { inject, ref, computed, onMounted, type Ref, onUnmounted } from 'vue';
import { type Game, type Player } from '@solaris-common';
import { useStore, type Store } from 'vuex';
import type { State } from "@/store";
import { toastInjectionKey } from '@/util/keys'
import { makeConfirm } from '@/util/confirm'
import { useIsHistoricalMode } from '@/util/reactiveHooks'
import WinCondition from "@/views/game/components/leaderboard/WinCondition.vue";

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenPlayerDetailRequested: [playerId: string],
  onViewSettingsRequested: [],
}>();

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const toast = inject(toastInjectionKey)!;

const activeTab: Ref<string | null> = ref(null);
const players: Ref<Player<string>[] | null> = ref(null);
const timeRemaining: Ref<null | string> = ref(null);
const isQuittingGame = ref(false);

const intervalFunction = ref(0);

const isHistoricalMode = useIsHistoricalMode(store);

const game = computed<Game<string>>(() => store.state.game);
const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));
const isTeamConquest = computed(() => GameHelper.isTeamConquest(game.value));
const canReadyToQuit = computed(() => game.value.settings.general.readyToQuit === 'enabled' && GameHelper.isGameStarted(game.value) && game.value.state.productionTick > 0);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const almostAfkReminder = computed(() => Boolean(userPlayer.value && userPlayer.value.missedTurns && userPlayer.value.missedTurns === game.value.settings.gameTime.afk.turnTimeout - 1));

const isUserPlayer = (player: Player<string>) => userPlayer.value?._id === player._id;

const recalculateTimeRemaining = () => {
  if (GameHelper.isRealTimeGame(game.value)) {
    timeRemaining.value = `Next tick: ${GameHelper.getCountdownTimeStringByTicks(game.value, 1)}`;
  } else if (GameHelper.isTurnBasedGame(game.value)) {
    timeRemaining.value = `Next turn: ${GameHelper.getCountdownTimeStringForTurnTimeout(game.value)}`;
  }
};

const getWinnerAlias = () => game.value.state.winner && GameHelper.getPlayerById(game.value, game.value.state.winner)?.alias;
const getWinningTeam = () => game.value.state.winningTeam && GameHelper.getTeamById(game.value, game.value.state.winningTeam)?.name;

const onCloseRequested = () => emit('onCloseRequested');
const onViewSettingsRequested = () => emit('onViewSettingsRequested');
const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const quitGame = async () => {
  isQuittingGame.value = true

  try {
    const response = await gameService.quitGame(game.value._id);

    if (response.status === 200) {
      AudioService.quit()
      toast.error(`You have quit ${game.value.settings.general.name}.`)
      router.push({ name: 'main-menu' })
    }
  } catch (err) {
    console.error(err);
  }

  isQuittingGame.value = false;
};

const confirmReadyToQuit = async (player: Player<string>) => {
  if (!isUserPlayer(player) || isHistoricalMode.value) {
    return;
  }

  let rtqFractionMessage = '';
  if (game.value.settings.general.readyToQuitFraction) {
    const percent = game.value.settings.general.readyToQuitFraction * 100;
    rtqFractionMessage = ` (or ${percent}% by star count out of all stars)`;
  }

  if (!await confirm('Ready to Quit?', `Are you sure you want declare that you are ready to quit? If all active players${rtqFractionMessage} declare ready to quit then the game will end early.`)) {
    return
  }

  try {
    const response = await gameService.confirmReadyToQuit(game.value._id);

    if (response.status === 200) {
      toast.success(`You have confirmed that you are ready to quit.`);

      player.readyToQuit = true;
    }
  } catch (err) {
    console.error(err)
  }
};

const unconfirmReadyToQuit = async (player: Player<string>) => {
  if (!isUserPlayer(player) || isHistoricalMode.value) {
    return;
  }

  try {
    const response = await gameService.unconfirmReadyToQuit(game.value._id);

    if (response.status === 200) {
      player.readyToQuit = false;
    }
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  activeTab.value = isTeamConquest.value ? 'team': 'player';

  players.value = game.value.galaxy.players;

  recalculateTimeRemaining();

  if (GameHelper.isGameInProgress(game.value) || GameHelper.isGamePendingStart(game.value)) {
    intervalFunction.value = setInterval(recalculateTimeRemaining, 250);
  }
});

onUnmounted(() => {
  clearInterval(intervalFunction.value);
});
</script>

<style scoped></style>
