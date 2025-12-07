<template>
<div class="menu-page container">
    <menu-title title="Diplomacy" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoading"/>

    <p v-if="!isFormalAlliancesEnabled" class="pb-1 text-danger">Formal alliances has been disabled in this game.</p>

    <p class="mb-2" v-if="isFormalAlliancesEnabled">
      Declare your diplomatic statuses to players.
    </p>

    <form-error-list :errors="errors" />

    <div class="row" v-if="!isLoading && isFormalAlliancesEnabled">
      <div class="table-responsive">
        <table class="table table-sm table-striped mb-0">
          <tbody>
            <diplomacy-row
              v-for="diplomaticStatus in diplomaticStatuses"
              :key="diplomaticStatus.playerIdTo"
              :diplomaticStatus="diplomaticStatus"
              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
              @onApiRequestError="onApiRequestError"
              @onApiRequestSuccess="onApiRequestSuccess"/>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-2" v-if="isFormalAlliancesEnabled">
      <hr/>

      <h5>Alliance Settings</h5>

      <ul>
        <li>
          <small>If you are allied with another player, you can visit their stars.</small>
        </li>
        <li>
          <small>Combat will not occur if all players at a star are <span class="text-warning">allied</span> with the star owner.</small>
        </li>
        <li v-if="isTradeRestricted">
          <small>You are only allowed to trade with allies.</small>
        </li>
        <li v-if="isMaxAlliancesEnabled">
          <small>You may only ally with a maximum of <span class="text-warning">{{ maxAlliances }} player(s)</span>.</small>
        </li>
        <li v-if="isAllianceUpkeepEnabled">
          <small>An alliance <span class="text-warning">upkeep cost</span> will be deducted at the end of every cycle based on your cycle income.</small>
        </li>
        <li v-if="isAllianceUpkeepEnabled">
          <small>Establishing an alliance will incur an <span class="text-warning">upfront upkeep fee</span> based on your cycle income.</small>
        </li>
      </ul>

      <p class="pb-2">
        See the <a href="https://solaris-games.github.io/solaris-docs/diplomacy#diplomatic-statuses" target="_blank">wiki</a> for more details.
      </p>
    </div>
</div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import DiplomacyRow from './DiplomacyRow.vue'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import FormErrorList from '../../../components/FormErrorList.vue'
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';
import { eventBusInjectionKey } from '../../../../eventBus'
import DiplomacyEventBusEventNames from '../../../../eventBusEventNames/diplomacy'
import {type DiplomaticStatus} from "@solaris-common";
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import {listDiplomacy} from "@/services/typedapi/diplomacy";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
  onCloseRequested: [],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const isFormalAlliancesEnabled = computed(() => DiplomacyHelper.isFormalAlliancesEnabled(game.value));
const isTradeRestricted = computed(() => DiplomacyHelper.isTradeRestricted(game.value));
const isMaxAlliancesEnabled = computed(() => DiplomacyHelper.isMaxAlliancesEnabled(game.value));
const maxAlliances = computed(() => DiplomacyHelper.maxAlliances(game.value));
const isAllianceUpkeepEnabled = computed(() => DiplomacyHelper.isAllianceUpkeepEnabled(game.value));

const isLoading = ref(false);
const errors = ref<string[]>([]);
const diplomaticStatuses = ref<DiplomaticStatus<string>[]>([]);

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const onCloseRequested = () => emit('onCloseRequested');

const onApiRequestSuccess = () => errors.value = [];

const onApiRequestError = (e: string[]) => errors.value = e;

const loadDiplomaticStatus = async () => {
  if (!isFormalAlliancesEnabled.value) {
    return;
  }

  isLoading.value = true;

  const response = await listDiplomacy(httpClient)(game.value._id);
  if (isOk(response)) {
    diplomaticStatuses.value = response.data;
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isLoading.value = false;
};

const onPlayerDiplomaticStatusChanged = (ev: { diplomaticStatus: DiplomaticStatus<string> }) => {
  const diplomaticStatus = diplomaticStatuses.value.find(d => d.playerIdTo === ev.diplomaticStatus.playerIdFrom);

  if (diplomaticStatus) {
    diplomaticStatus.statusTo = ev.diplomaticStatus.statusFrom;
    diplomaticStatus.statusFrom = ev.diplomaticStatus.statusTo;
    diplomaticStatus.actualStatus = ev.diplomaticStatus.actualStatus;
  }
};

onMounted(() => {
  eventBus.on(DiplomacyEventBusEventNames.PlayerDiplomaticStatusChanged, onPlayerDiplomaticStatusChanged);

  loadDiplomaticStatus();

  onUnmounted(() => {
    eventBus.off(DiplomacyEventBusEventNames.PlayerDiplomaticStatusChanged, onPlayerDiplomaticStatusChanged);
  });
});
</script>

<style scoped>
table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }
}
</style>
