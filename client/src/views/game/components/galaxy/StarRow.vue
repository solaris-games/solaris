<template>
<tr>
    <td><player-icon v-if="star.ownedByPlayerId" :playerId="star.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td><i v-if="star.warpGate" class="fas fa-check"></i></td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-success me-2" title="Economic infrastructure - Contributes to credits earned at the end of a cycle">{{star.infrastructure.economy}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-warning me-2" title="Industrial infrastructure - Contributes to ship production">{{star.infrastructure.industry}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-info" title="Scientific infrastructure - Contributes to technology research">{{star.infrastructure.science}}</span>
    </td>
    <td class="text-end" v-if="isEconomyEnabled">
      <span v-if="hasEconomyCost && !canUpgradeEconomy">${{star.upgradeCosts!.economy}}</span>
      <a href="javascript:;" v-if="hasEconomyCost && canUpgradeEconomy"
        @click="upgradeEconomy()" :disabled="isHistoricalMode">${{star.upgradeCosts!.economy}}</a>
    </td>
    <td class="text-end" v-if="isIndustryEnabled">
      <span v-if="hasIndustryCost && !canUpgradeIndustry">${{star.upgradeCosts!.industry}}</span>
      <a href="javascript:;" v-if="hasIndustryCost && canUpgradeIndustry"
        @click="upgradeIndustry()" :disabled="isHistoricalMode">${{star.upgradeCosts!.industry}}</a>
    </td>
    <td class="text-end" v-if="isScienceEnabled">
      <span v-if="hasScienceCost && !canUpgradeScience">${{star.upgradeCosts!.science}}</span>
      <a href="javascript:;" v-if="hasScienceCost && canUpgradeScience"
        @click="upgradeScience()" :disabled="isHistoricalMode">${{star.upgradeCosts!.science}}</a>
    </td>
</tr>
</template>

<script setup lang="ts">
import AudioService from '../../../../game/audio'
import gameHelper from '../../../../services/gameHelper'
import PlayerIcon from '../player/PlayerIcon.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "../../../../eventBus";
import { ref, inject, computed } from 'vue';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {Star, Player} from "@solaris-common";
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';
import {makeConfirm} from "@/util/confirm";
import { upgradeEconomy as upgradeEconomyReq, upgradeIndustry as upgradeIndustryReq, upgradeScience as upgradeScienceReq } from '@/services/typedapi/star';
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {makeUpgrade} from "@/views/game/components/star/upgrade";

const props = defineProps<{
  star: Star<string>,
  allowUpgrades: boolean,
}>();

const emit = defineEmits<{
  onOpenStarDetailRequested: [starId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const isHistoricalMode = useIsHistoricalMode(store);

const isUpgradingEconomy = ref(false);
const isUpgradingIndustry = ref(false);
const isUpgradingScience = ref(false);

const userPlayer = computed<Player<string> | undefined>(() => gameHelper.getUserPlayer(store.state.game));

const hasEconomyCost = computed(() => props.star.upgradeCosts?.economy);
const hasIndustryCost = computed(() => props.star.upgradeCosts?.industry);
const hasScienceCost = computed(() => props.star.upgradeCosts?.science);

const isEconomyEnabled = computed(() => store.state.game.settings.player.developmentCost.economy !== 'none');
const isIndustryEnabled = computed(() => store.state.game.settings.player.developmentCost.industry !== 'none');
const isScienceEnabled = computed(() => store.state.game.settings.player.developmentCost.science !== 'none');

const canUpgradeEconomy = computed(() => props.allowUpgrades && hasEconomyCost.value && !isUpgradingEconomy.value && (userPlayer.value?.credits || 0) >= (props.star.upgradeCosts?.economy || 0));
const canUpgradeIndustry = computed(() => props.allowUpgrades && hasIndustryCost.value && !isUpgradingIndustry.value && (userPlayer.value?.credits || 0) >= (props.star.upgradeCosts?.industry || 0));
const canUpgradeScience = computed(() => props.allowUpgrades && hasScienceCost.value && !isUpgradingScience.value && (userPlayer.value?.credits || 0) >= (props.star.upgradeCosts?.science || 0));

const clickStar = () => emit('onOpenStarDetailRequested', props.star._id);

const goToStar = () => eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToLocation, { location: props.star.location });

const upgrade = makeUpgrade(store, toast, props.star);

const upgradeEconomy = upgrade('economy', store.state.settings.star.confirmBuildEconomy === 'enabled', isUpgradingEconomy, 'gameStarEconomyUpgraded', upgradeEconomyReq(httpClient));
const upgradeIndustry = upgrade('industry', store.state.settings.star.confirmBuildIndustry === 'enabled', isUpgradingIndustry, 'gameStarIndustryUpgraded', upgradeIndustryReq(httpClient));
const upgradeScience = upgrade('science', store.state.settings.star.confirmBuildScience === 'enabled', isUpgradingScience, 'gameStarScienceUpgraded', upgradeScienceReq(httpClient));
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

td.no-padding {
  padding: 12px 0px !important;
}

td.sm-padding {
  padding: 12px 3px !important;
}
</style>
