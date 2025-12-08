<template>
    <div v-if="isTradeAllowed && player">
      <reputation v-if="player.isAIControlled" :playerId="player._id"/>

      <div v-if="isTradePossibleByScanning && isTradePossibleByDiplomacy && userPlayer">
        <sendCredits v-if="tradeCreditsIsEnabled" :player="player" :userPlayer="userPlayer"/>
        <sendCreditsSpecialists v-if="tradeCreditsSpecialistsIsEnabled" :player="player" :userPlayer="userPlayer"/>
        <sendTechnology v-if="player && tradeTechnologyIsEnabled" :playerId="player._id"/>
      </div>

      <p v-if="!isTradePossibleByScanning" class="text-danger pt-2 pb-0 mb-0">You cannot trade with this player, they are not within scanning range.</p>
      <p v-if="!isTradePossibleByDiplomacy" class="text-danger pt-2 pb-0 mb-0">You cannot trade with this player, they are not an ally.</p>
    </div>
</template>

<script setup lang="ts">
import SendTechnology from './SendTechnology.vue';
import SendCredits from './SendCredits.vue';
import SendCreditsSpecialists from './SendCreditsSpecialists.vue';
import Reputation from './Reputation.vue';
import GameHelper from '../../../../services/gameHelper';
import DiplomacyHelper from '../../../../services/diplomacyHelper';
import { ref, inject, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import type {Game, Player} from "@/types/game";
import type {DiplomaticStatus} from "@solaris-common";
import {detailDiplomacy} from "@/services/typedapi/diplomacy";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const props = defineProps<{
  playerId: string,
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const player = ref<Player | null>(null);
const userPlayer = ref<Player | null>(null);
const diplomaticStatus = ref<DiplomaticStatus<string> | null>(null);

const tradeCreditsIsEnabled = computed(() => game.value.settings.player.tradeCredits);

const isGameFinished = computed(() => GameHelper.isGameFinished(game.value));

const isTradePossibleByScanning = computed(() =>
  player.value &&
  ((player.value.stats?.totalStars || 0) > 0 || GameHelper.isDarkModeExtra(game.value)) &&
  (game.value.settings.player.tradeScanning === 'all' || player.value.isInScanningRange));

const tradeCreditsSpecialistsIsEnabled = computed(() =>
  game.value.settings.player.tradeCreditsSpecialists &&
  game.value.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists');

const tradeTechnologyIsEnabled = computed(() => game.value.settings.player.tradeCost > 0);

const isTradePossibleByDiplomacy = computed(() =>
  !DiplomacyHelper.isFormalAlliancesEnabled(game.value) ||
  !DiplomacyHelper.isTradeRestricted(game.value) ||
  (diplomaticStatus.value && diplomaticStatus.value.actualStatus == 'allies'));

const isTradeAllowed = computed(() =>
  game.value.state.startDate &&
  userPlayer.value &&
  player.value &&
  userPlayer.value._id !== player.value._id &&
  !userPlayer.value.defeated &&
  !isGameFinished.value &&
  (tradeTechnologyIsEnabled.value || tradeCreditsIsEnabled.value || tradeCreditsSpecialistsIsEnabled.value));

const loadDiplomaticStatus = async () => {
  if (!userPlayer.value || props.playerId === userPlayer.value._id) {
    return;
  }

  const response = await detailDiplomacy(httpClient)(game.value._id, props.playerId);
  if (isOk(response)) {
    diplomaticStatus.value = response.data;
  } else {
    console.error(formatError(response));
  }
};

onMounted(() => {
  player.value = GameHelper.getPlayerById(game.value, props.playerId) || null;
  userPlayer.value = GameHelper.getUserPlayer(game.value) || null;

  loadDiplomaticStatus();
});
</script>

<style scoped>
</style>
