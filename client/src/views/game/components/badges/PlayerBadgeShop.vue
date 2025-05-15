<template>
  <div class="menu-page container">
    <menu-title title="Award Player Badge" @onCloseRequested="onCloseRequested">
      <button @click="onOpenPlayerDetailRequested" class="btn btn-sm btn-outline-primary"
        title="Back to Player Profile"><i class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row">
      <div class="col text-center pt-3">
        <p class="mb-1" v-if="recipientPlayer">Buy <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{
          recipientPlayer.alias }}</a>
          a <strong>Badge of Honor<i class="fas fa-medal ms-1"></i></strong></p>

        <p v-if="userCredits"><small>You have <span class="text-warning"><strong>{{ userCredits }}</strong> Galactic
              Credits</span>.</small>
        </p>
      </div>
    </div>

    <loading-spinner :loading="isLoading" />

    <div class="pt-3 pb-3" v-if="!isLoading && userCredits && recipientPlayer">
      <badge-shop-list :badges="badges" :userCredits="userCredits" :recipientName="recipientPlayer.alias"
        @onPurchaseBadgeConfirmed="onPurchaseBadgeConfirmed" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref, inject } from 'vue';
import type { Axios } from 'axios';
import MenuTitle from '../../components/MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import GameHelper from '../../../../services/gameHelper'
import BadgeShopList from './BadgeShopList.vue'
import type { State } from "../../../../store";
import { formatError, httpInjectionKey, isError, isOk } from "../../../../services/typedapi";
import type { ToastPluginApi } from "vue-toast-notification";
import { toastInjectionKey } from "../../../../util/keys";
import type { Badge } from "@solaris-common";
import type { Player } from "../../../../types/game";
import { useStore } from 'vuex';
import type { Store } from 'vuex/types/index.js';
import { purchaseBadgeForPlayer } from "../../../../services/typedapi/badge";
import { getCredits } from "../../../../services/typedapi/user";


const props = defineProps<{ recipientPlayerId: string }>();

const isLoading: Ref<boolean> = ref(true);
const userCredits: Ref<number | null> = ref(null);
const badges: Ref<Badge[]> = ref([]);
const recipientPlayer: Ref<Player | undefined> = ref(undefined);

const emit = defineEmits<{
  onCloseRequested: [e: Event],
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const store = useStore() as Store<State>;

const httpClient: Axios = inject(httpInjectionKey)!;

const toast: ToastPluginApi = inject(toastInjectionKey)!;

const loadGalacticCredits = async () => {
  isLoading.value = true

  const response = await getCredits(httpClient)();

  if (isOk(response)) {
    userCredits.value = response.data.credits

    store.commit('setUserCredits', response.data)
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false
}

onMounted(async () => {
  recipientPlayer.value = GameHelper.getPlayerById(store.state.game!, props.recipientPlayerId)

  const allBadges = await store.dispatch('getBadges');
  badges.value = allBadges.filter(b => b.price);
  await loadGalacticCredits()
});

const onCloseRequested = (e: Event) => {
  emit('onCloseRequested', e)
}

const onOpenPlayerDetailRequested = () => {
  emit('onOpenPlayerDetailRequested', props.recipientPlayerId)
}

const onPurchaseBadgeConfirmed = async (badge: Badge) => {
  isLoading.value = true

  try {
    const response = await purchaseBadgeForPlayer(httpClient)(store.state.game!._id, recipientPlayer.value!._id, badge.key);

    if (!isError(response)) {
      toast.success(`You successfully purchased the ${badge.name} badge for ${recipientPlayer.value!.alias}!`)

      onOpenPlayerDetailRequested()
    }
  } catch (err) {
    console.error(err)
  }

  isLoading.value = false
}
</script>

<style scoped></style>
