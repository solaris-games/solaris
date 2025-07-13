<template>
    <div class="position-static btn-group" v-if="canIgnoreEconomy || canIgnoreIndustry || canIgnoreScience">
        <button class="btn btn-sm dropdown-toggle"
            :class="{'btn-danger':highlightIgnoredInfrastructure && getInfrastructureIgnoreStatus(highlightIgnoredInfrastructure),
                     'btn-outline-success':highlightIgnoredInfrastructure && !getInfrastructureIgnoreStatus(highlightIgnoredInfrastructure)}"
            type="button" data-bs-toggle="dropdown" data-boundary="viewport" aria-haspopup="true" aria-expanded="false">
            <i class="fas me-1" :class="{'fa-ban':isAllIgnored,'fa-check-double':isAllIncluded,'fa-check':!isAllIgnored && !isAllIncluded}"></i>
        </button>
        <div class="dropdown-menu">
            <h6 class="dropdown-header">Bulk Upgrade</h6>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('economy')" v-if="canIgnoreEconomy">
                <i class="fas me-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('economy'), 'fa-check': !getInfrastructureIgnoreStatus('economy')}"></i>
                Economy
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('industry')" v-if="canIgnoreIndustry">
                <i class="fas me-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('industry'), 'fa-check': !getInfrastructureIgnoreStatus('industry')}"></i>
                Industry
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('science')" v-if="canIgnoreScience">
                <i class="fas me-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('science'), 'fa-check': !getInfrastructureIgnoreStatus('science')}"></i>
                Science
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnoreAll(true)">
                <i class="fas fa-ban me-1"></i>
                Ignore All
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnoreAll(false)">
                <i class="fas fa-check me-1"></i>
                Include All
            </a>
        </div>
    </div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import { inject, computed } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';
import type {InfrastructureType} from "@solaris-common";
import { toggleBulkIgnore as toggleBulkIgnoreReq, toggleBulkIgnoreAll as toggleBulkIgnoreAllReq } from '@/services/typedapi/star';

const props = defineProps<{
  starId: string,
  highlightIgnoredInfrastructure?: InfrastructureType
}>();

const emit = defineEmits<{
  bulkIgnoreChanged: [{ starId: string }],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const star = computed(() => GameHelper.getStarById(store.state.game, props.starId)!);

const canIgnoreEconomy = computed(() => store.state.game.settings.player.developmentCost.economy !== 'none');
const canIgnoreIndustry = computed(() => store.state.game.settings.player.developmentCost.industry !== 'none');
const canIgnoreScience = computed(() => store.state.game.settings.player.developmentCost.science !== 'none');

const isAllIgnored = computed(() => (!canIgnoreEconomy.value || getInfrastructureIgnoreStatus('economy'))
  && (!canIgnoreIndustry.value || getInfrastructureIgnoreStatus('industry'))
  && (!canIgnoreScience.value || getInfrastructureIgnoreStatus('science'))
);

const isAllIncluded = computed(() => (!canIgnoreEconomy.value || !getInfrastructureIgnoreStatus('economy'))
  && (!canIgnoreIndustry.value || !getInfrastructureIgnoreStatus('industry'))
  && (!canIgnoreScience.value || !getInfrastructureIgnoreStatus('science'))
);

const triggerChanged = () => {
  emit("bulkIgnoreChanged", {
    starId: props.starId
  });
  const star = GameHelper.getStarById(store.state.game, props.starId);
  eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
};

const getInfrastructureIgnoreStatus = (infrastructureType: InfrastructureType) => star.value.ignoreBulkUpgrade![infrastructureType];

const toggleBulkIgnore = async (infrastructureType: InfrastructureType) => {
  const response = await toggleBulkIgnoreReq(httpClient)(store.state.game._id, props.starId, infrastructureType);

  if (isOk(response)) {
    const newVal = !star.value.ignoreBulkUpgrade![infrastructureType];

    star.value.ignoreBulkUpgrade![infrastructureType] = newVal;

    if (newVal) {
      toast.default(`${star.value.name} ${infrastructureType} is now ignored by Bulk Upgrade.`)
    } else {
      toast.default(`${star.value.name} ${infrastructureType} is now included in Bulk Upgrade.`)
    }

    triggerChanged();
  } else {
    console.error(formatError(response));
    toast.error("Failed to set bulk upgrade ignore");
  }
};

const toggleBulkIgnoreAll = async (ignoreStatus: boolean) => {
  const response = await toggleBulkIgnoreAllReq(httpClient)(store.state.game._id, star.value._id, ignoreStatus);

  if (isOk(response)) {
    star.value.ignoreBulkUpgrade!.economy = ignoreStatus;
    star.value.ignoreBulkUpgrade!.industry = ignoreStatus;
    star.value.ignoreBulkUpgrade!.science = ignoreStatus;

    if (ignoreStatus) {
      toast.default(`${star.value.name} is now ignored by Bulk Upgrade.`);
    } else {
      toast.default(`${star.value.name} is now included in Bulk Upgrade.`);
    }

    triggerChanged();
  } else {
    console.error(formatError(response));
    toast.error("Failed to set bulk upgrade ignore");
  }
};
</script>

<style scoped>
</style>
