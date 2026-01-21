<template>
<tr :class="{'allies' : diplomaticStatus.actualStatus==='allies', 'enemies' : diplomaticStatus.actualStatus==='enemies'}">
  <td :style="{'width': '8px', 'background-color': getFriendlyColour(diplomaticStatus.playerIdTo)}"></td>
  <td class="col-avatar" :title="getPlayerAlias(diplomaticStatus.playerIdTo)">
    <player-avatar @onClick="onOpenPlayerDetailRequested(diplomaticStatus.playerIdTo)" :player="getPlayer(diplomaticStatus.playerIdTo)"/>
  </td>
  <td class="ps-2 pt-3 pb-2">
    <h5 class="alias-title">{{getPlayerAlias(diplomaticStatus.playerIdTo)}}</h5>
  </td>
  <td class="fit pt-3 pe-1">
    <diplomacy-icons
      :statusFrom="diplomaticStatus.statusFrom"
      :statusTo="diplomaticStatus.statusTo"
      :actualStatus="diplomaticStatus.actualStatus"/>
  </td>
  <td class="fit pt-3 pb-2 pe-2" v-if="!isGameFinished">
    <div class="btn-group">
      <button class="btn btn-sm" :class="{'btn-success':diplomaticStatus.statusTo === 'allies', 'btn-outline-success':diplomaticStatus.statusTo !== 'allies'}" @click="declareAlly(diplomaticStatus)" title="Declare this player an ally"><i class="fas fa-handshake"></i></button>
      <button class="btn btn-sm" :class="{'btn-info':diplomaticStatus.statusTo === 'neutral', 'btn-outline-info':diplomaticStatus.statusTo !== 'neutral'}" @click="declareNeutral(diplomaticStatus)" title="Declare this player as neutral"><i class="fas fa-dove"></i></button>
      <button class="btn btn-sm" :class="{'btn-danger':diplomaticStatus.statusTo === 'enemies', 'btn-outline-danger':diplomaticStatus.statusTo !== 'enemies'}" @click="declareEnemy(diplomaticStatus)" title="Declare this player as an enemy"><i class="fas fa-crosshairs"></i></button>
    </div>
  </td>
</tr>
</template>

<script setup lang="ts">
import PlayerAvatar from '../menu/PlayerAvatar.vue';
import gameHelper from '../../../../services/gameHelper';
import DiplomacyHelper from '../../../../services/diplomacyHelper';
import DiplomacyIcons from './DiplomacyIcons.vue';
import { inject, computed } from 'vue';
import { useStore } from 'vuex';
import type {DiplomaticStatus} from "@solaris-common";
import {makeConfirm} from "@/util/confirm";
import type {Game} from "@/types/game";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {ally, enemy, neutral} from "@/services/typedapi/diplomacy";

const props = defineProps<{
  diplomaticStatus: DiplomaticStatus<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
  onApiRequestSuccess: [],
  onApiRequestError: [errors: string[]],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);
const confirm = makeConfirm(store);

const isGameFinished = computed(() => gameHelper.isGameFinished(game.value));
const userPlayer = computed(() => gameHelper.getUserPlayer(game.value)!);

const getPlayer = (playerId: string) => gameHelper.getPlayerById(game.value, playerId)!;

const getPlayerAlias = (playerId: string) => getPlayer(playerId).alias;

const getFriendlyColour = (playerId: string) => store.getters.getColourForPlayer(playerId).value;

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const declareAlly = async (diplomaticStatus: DiplomaticStatus<string>) => {
  const playerAlias = getPlayerAlias(diplomaticStatus.playerIdTo);

  let allianceFee = 0
  let cycleCredits = gameHelper.calculateIncome(game.value, userPlayer.value);

  if (DiplomacyHelper.isAllianceUpkeepEnabled(game.value)) {
    allianceFee = DiplomacyHelper.getAllianceUpkeepCost(game.value, userPlayer.value, cycleCredits, 1);

    if (!await confirm('Alliance Fee', `Allying with this player will cost you $${allianceFee} credits, are you sure you want to continue?`)) {
      return;
    }
  }

  if (game.value.settings.diplomacy.lockedAlliances === 'enabled') {
    if (!await confirm('Permanent Alliance', 'If you form an alliance in this game, you will not be able to cancel it.')) {
      return;
    }
  }

  if (!await confirm('Declare Allies', `Are you sure you want to change your diplomatic status to ${playerAlias} to allied?`)) {
    return;
  }

  const response = await ally(httpClient)(game.value._id, diplomaticStatus.playerIdTo);
  if (isOk(response)) {
    if (response.data.statusTo === 'allies') {
      toast.success(`Your diplomatic status to ${playerAlias} is now allied.`);
    } else {
      toast.error(`You can not ally ${playerAlias}. Check the maximum alliance limits.`);
    }

    diplomaticStatus.statusFrom = response.data.statusFrom;
    diplomaticStatus.statusTo = response.data.statusTo;
    diplomaticStatus.actualStatus = response.data.actualStatus;

    userPlayer.value.credits -= allianceFee;

    emit('onApiRequestSuccess')
  } else {
    console.error(formatError(response));
    emit('onApiRequestError', extractErrors(response));
  }
};

const declareEnemy = async (diplomaticStatus: DiplomaticStatus<string>) => {
  const playerAlias = getPlayerAlias(diplomaticStatus.playerIdTo);

  if (!await confirm('Declare Enemy', `Are you sure you want to change your diplomatic status to ${playerAlias} to enemies?`)) {
    return;
  }

  const response = await enemy(httpClient)(game.value._id, diplomaticStatus.playerIdTo);

  if (isOk(response)) {
    toast.success(`Your diplomatic status to ${playerAlias} is now enemies.`);

    diplomaticStatus.statusFrom = response.data.statusFrom;
    diplomaticStatus.statusTo = response.data.statusTo;
    diplomaticStatus.actualStatus = response.data.actualStatus;

    emit('onApiRequestSuccess');
  } else {
    console.error(formatError(response));
    emit('onApiRequestError', extractErrors(response));
  }
};

const declareNeutral = async (diplomaticStatus: DiplomaticStatus<string>) => {
  const playerAlias = getPlayerAlias(diplomaticStatus.playerIdTo);

  if (!await confirm('Declare Neutral', `Are you sure you want to change your diplomatic status to ${playerAlias} to neutral?`)) {
    return;
  }

  const response = await neutral(httpClient)(game.value._id, diplomaticStatus.playerIdTo);
  if (isOk(response)) {
    toast.success(`Your diplomatic status to ${playerAlias} is now neutral.`);

    diplomaticStatus.statusFrom = response.data.statusFrom;
    diplomaticStatus.statusTo = response.data.statusTo;
    diplomaticStatus.actualStatus = response.data.actualStatus;

    emit('onApiRequestSuccess');
  } else {
    console.error(formatError(response));
    emit('onApiRequestError', extractErrors(response));
  }
};
</script>

<style scoped>
.col-avatar {
  position:absolute;
  width: 59px;
  height: 59px;
  cursor: pointer;
  padding: 0;
}

.alias-title {
  padding-left: 59px;
}

tr {
  height: 59px;
}

td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

.allies {
  background: linear-gradient(to left, black 40%, green 95%);
}

.enemies {
  background: linear-gradient(to left, black 40%, #DD0000  95%);
}


@media screen and (max-width: 576px) {
  tr {
    height: 45px;
  }

  .alias-title {
    padding-left: 45px;
  }

  .col-avatar {
    width: 45px;
  }
}
</style>
