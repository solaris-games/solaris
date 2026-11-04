<template>
  <tr
    :class="{
      allies: diplomaticStatus.actualStatus === 'allies',
      enemies: diplomaticStatus.actualStatus === 'enemies',
    }"
  >
    <td
      :style="{
        width: '8px',
        'background-color': getFriendlyColour(diplomaticStatus.playerIdTo),
      }"
    ></td>
    <td class="col-avatar" :title="getPlayerAlias(diplomaticStatus.playerIdTo)">
      <player-avatar
        @onClick="onOpenPlayerDetailRequested(diplomaticStatus.playerIdTo)"
        :player="getPlayer(diplomaticStatus.playerIdTo)"
      />
    </td>
    <td class="ps-2 pt-3 pb-2">
      <h5 class="alias-title">
        {{ getPlayerAlias(diplomaticStatus.playerIdTo) }}
      </h5>
    </td>
    <td class="fit pt-3 pe-1">
      <diplomacy-icons
        :statusFrom="diplomaticStatus.statusFrom"
        :statusTo="diplomaticStatus.statusTo"
        :actualStatus="diplomaticStatus.actualStatus"
      />
    </td>
    <td class="fit pt-3 pb-2 pe-2" v-if="!isGameFinished">
      <diplomacy-toggle
        :diplomatic-status="diplomaticStatus"
        @on-api-request-error="(e) => emit('onApiRequestError', e)"
        @on-api-request-success="() => emit('onApiRequestSuccess')"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import PlayerAvatar from "../menu/PlayerAvatar.vue";
import gameHelper from "../../../../services/gameHelper";
import DiplomacyHelper from "../../../../services/diplomacyHelper";
import DiplomacyIcons from "./DiplomacyIcons.vue";
import { inject, computed } from "vue";
import type { DiplomaticStatus } from "@solaris/common";
import { useConfirm } from "@/hooks/confirm.ts";
import type { Game } from "@/types/game";
import { extractErrors, formatError, isOk } from "@solaris/api-client";
import { httpInjectionKey } from "@/services/http";
import { ally, enemy, neutral } from "@solaris/api-client/diplomacy";
import { useColourStore } from "@/stores/colour";

import { useToast } from "vue-toast-notification";
import DiplomacyToggle from "@/views/game/components/diplomacy/DiplomacyToggle.vue";
const props = defineProps<{
  diplomaticStatus: DiplomaticStatus<string>;
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string];
  onApiRequestSuccess: [];
  onApiRequestError: [errors: string[]];
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const colourStore = useColourStore();

const isGameFinished = computed(() => gameHelper.isGameFinished(game.value));

const getPlayer = (playerId: string) =>
  gameHelper.getPlayerById(game.value, playerId)!;

const getPlayerAlias = (playerId: string) => getPlayer(playerId).alias;

const getFriendlyColour = (playerId: string) =>
  colourStore.getColourForPlayer(game.value, playerId)!.value;

const onOpenPlayerDetailRequested = (playerId: string) =>
  emit("onOpenPlayerDetailRequested", playerId);
</script>

<style scoped>
.col-avatar {
  position: absolute;
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
  background: linear-gradient(to left, black 40%, #dd0000 95%);
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
