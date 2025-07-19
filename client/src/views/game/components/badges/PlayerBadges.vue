<template>
  <div>
    <loading-spinner :loading="isLoading"/>

    <div class="row" v-if="isNormalAnonymity && (!isLoading || !badges.length)">
      <div v-if="!badges.length" class="col text-center pt-3">
        <p class="mb-3">This player has no badges.</p>
      </div>
    </div>

    <div class="row bg-dark" v-if="!isLoading && userPlayer && playerId !== userPlayer._id && canPurchaseBadges">
      <div class="col text-center pt-3">
        <p class="mb-3">Buy this player a <a href="javascript:;" @click="onOpenPurchasePlayerBadgeRequested">Badge of
          Honor<i class="fas fa-medal ms-1"></i></a></p>
      </div>
    </div>

    <div class="row" v-if="isExtraAnonymity && (!isLoading || !badges.length)">
      <div v-if="!badges.length" class="col text-center pt-3">
        <p class="mb-3"><small>Badges are hidden in anonymous games.</small></p>
      </div>
    </div>

    <div class="pt-3 pb-3 badges" v-if="!isLoading && badges.length">
      <badge v-for="badge in badges" :key="badge.badge" :badge="badge" :allBadges="allBadges"
             @onOpenPurchasePlayerBadgeRequested="onOpenPurchasePlayerBadgeRequested"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, type Ref, inject} from 'vue';
import type {Axios} from 'axios';
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import Badge from './Badge.vue'
import GameHelper from '../../../../services/gameHelper'
import type {State} from "../../../../store";
import {useStore} from 'vuex';
import type {Store} from 'vuex/types/index.js';
import type {AwardedBadge, Badge as TBadge} from "@solaris-common";
import {getBadgesForPlayer} from "../../../../services/typedapi/badge";
import {httpInjectionKey, isError} from "../../../../services/typedapi";

const props = defineProps<{ playerId: string }>();

const emit = defineEmits<{
  onOpenPurchasePlayerBadgeRequested: [playerId: string]
}>();

const isLoading = ref(true);

const allBadges: Ref<TBadge[]> = ref([]);

const badges: Ref<AwardedBadge<string>[]> = ref([]);

const store = useStore() as Store<State>;

const game = computed(() => store.state.game!);

const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId));

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

const isNormalAnonymity = computed(() => GameHelper.isNormalAnonymity(game.value));

const isExtraAnonymity = computed(() => GameHelper.isExtraAnonymity(game.value));

const isFinished = computed(() => GameHelper.isGameFinished(game.value));

const canPurchaseBadges = computed(() => (!isExtraAnonymity.value || isFinished.value) && userPlayer.value && userPlayer.value._id !== player.value!._id);

const canViewBadges = computed(() => player.value && (!isExtraAnonymity.value));

const onOpenPurchasePlayerBadgeRequested = () => {
  if (canPurchaseBadges.value) {
    emit('onOpenPurchasePlayerBadgeRequested', props.playerId);
  }
}

const httpClient: Axios = inject(httpInjectionKey)!;

onMounted(async () => {
  allBadges.value = await store.dispatch('getBadges');

  if (!canViewBadges.value) {
    return;
  }

  isLoading.value = true

  try {
    const response = await getBadgesForPlayer(httpClient)(game.value._id, props.playerId)

    if (isError(response)) {
      badges.value = [];
      console.error(response.cause);
    } else {
      badges.value = response.data.sort((a, b) => {
        if (!a.time) {
          return 1;
        } else if (!b.time) {
          return -1;
        } else {
          return a.time.getTime() - b.time.getTime();
        }
      });
    }
  } catch (err) {
    console.error(err)
  }

  isLoading.value = false;
});
</script>

<style scoped>
.badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
</style>
