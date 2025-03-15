<template>
  <div class="menu-page container">
    <menu-title title="Award Player Badge" @onCloseRequested="onCloseRequested">
      <button @click="onOpenPlayerDetailRequested" class="btn btn-sm btn-outline-primary"
              title="Back to Player Profile"><i class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row">
      <div class="col text-center pt-3">
        <p class="mb-1" v-if="recipientPlayer">Buy <a href="javascript:;"
                                                      @click="onOpenPlayerDetailRequested">{{ recipientPlayer.alias }}</a>
          a <strong>Badge of Honor<i class="fas fa-medal ms-1"></i></strong></p>

        <p v-if="userCredits"><small>You have <span class="text-warning"><strong>{{ userCredits.credits }}</strong> Galactic Credits</span>.</small>
        </p>
      </div>
    </div>

    <loading-spinner :loading="isLoading"/>

    <div class="pt-3 pb-3" v-if="!isLoading && userCredits && recipientPlayer">
      <badge-shop-list :badges="badges" :userCredits="userCredits.credits" :recipientName="recipientPlayer.alias"
                       @onPurchaseBadgeConfirmed="onPurchaseBadgeConfirmed"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, type Ref, inject} from 'vue';
import type {Axios} from 'axios';
import MenuTitle from '../../components/MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import BadgeApiService from '../../../../services/api/badge'
import UserApiService from '../../../../services/api/user'
import GameHelper from '../../../../services/gameHelper'
import BadgeShopList from './BadgeShopList.vue'
import type {State} from "../../../../store";
import {httpInjectionKey, isError} from "../../../../services/typedapi";
import type {ToastPluginApi} from "vue-toast-notification";
import {toastInjectionKey} from "../../../../util/keys";
import type {Badge} from "@solaris-common";
import type {Player} from "../../../../types/game";
import {useStore} from 'vuex';
import type {Store} from 'vuex/types/index.js';
import {purchaseBadgeForPlayer} from "@/services/typedapi/badge";

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

  try {
    const response = await UserApiService.getUserCredits()

    if (response.status === 200) {
      userCredits.value = response.data

      store.commit('setUserCredits', response.data)
    }
  } catch (err) {
    console.error(err)
  }

  isLoading.value = false
}

onMounted(async () => {
  recipientPlayer.value = GameHelper.getPlayerById(store.state.game!, props.recipientPlayerId)

  badges.value = await store.dispatch('getBadges');
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

/*


export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner,
    'badge-shop-list': BadgeShopList
  },
  props: {
    recipientPlayerId: String
  },
  data () {
    return {
        isLoading: false,
        userCredits: null,
        badges: [],
        recipientPlayer: null
    }
  },
  async mounted () {
        this.recipientPlayer = GameHelper.getPlayerById(this.$store.state.game, this.recipientPlayerId)

        await this.loadGalacticCredits()
        await this.loadBadges()
  },
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested () {
        this.$emit('onOpenPlayerDetailRequested', this.recipientPlayerId)
    },
    async loadGalacticCredits () {
        this.isLoading = true

        try {
            let response = await UserApiService.getUserCredits()

            if (response.status === 200) {
                this.userCredits = response.data

                this.$store.commit('setUserCredits', response.data.credits)
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoading = false
    },
    async loadBadges () {
        this.isLoading = true

        try {
            let response = await BadgeApiService.listBadges(this.$store.state.game._id)

            if (response.status === 200) {
                this.badges = response.data
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoading = false
    },
    async onPurchaseBadgeConfirmed (badge) {
        this.isLoading = true

        try {
            let response = await BadgeApiService.purchaseBadgeForPlayer(this.$store.state.game._id, this.recipientPlayer._id, badge.key)

            if (response.status === 200) {
                this.$toast.success(`You successfully purchased the ${badge.name} badge for ${this.recipientPlayer.alias}!`)

                this.onOpenPlayerDetailRequested()
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoading = false
    }
  }
}*/
</script>

<style scoped>
</style>
