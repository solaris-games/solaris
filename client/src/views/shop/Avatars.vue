<template>
  <view-container :is-auth-page="true">
    <view-title title="Avatar Shop" />

    <p>Unlock new races to play with <strong class="text-warning">Galactic Credits</strong>. <router-link
        :to="{ name: 'galactic-credits-shop' }"><i class="fas fa-shopping-basket"></i> Purchase Galactic
        Credits</router-link> or earn credits by winning official games.</p>
    <h5 v-if="userCredits">You have <span class="text-warning"><strong>{{ userCredits }}</strong> Galactic Credits</span>.
    </h5>

    <hr />

    <loading-spinner v-if="isLoading" />

    <div v-if="avatars">
      <div class="row mb-4" v-for="avatar in sortedAvatars" :key="avatar.id">
        <div class="col-auto">
          <img :src="getAvatarImage(avatar)" width="128" height="128">
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              <h5>{{ avatar.name }}<span class="badge bg-success ms-2" v-if="avatar.isPatronAvatar"><i
                    class="fas fa-handshake"></i> Patron Avatar</span></h5>
            </div>
            <div class="col-auto">
              <button class="btn btn-sm btn-success" v-if="!avatar.purchased && (userCredits || 0) >= avatar.price"
                @click="purchaseAvatar(avatar)">
                <i class="fas fa-shopping-basket"></i> {{ avatar.price }} Credit<span v-if="avatar.price > 1">s</span>
              </button>
              <router-link :to="{ name: 'galactic-credits-shop' }" class="btn btn-sm btn-outline-danger"
                v-if="!avatar.purchased && (userCredits || 0) < avatar.price">
                <i class="fas fa-coins"></i> {{ avatar.price }} Credit<span v-if="avatar.price > 1">s</span>
              </router-link>
              <h5><span class="badge bg-primary" v-if="avatar.purchased"><i class="fas fa-check"></i> Unlocked</span>
              </h5>
            </div>
            <div class="col-12">
              <p><small class="linebreaks">{{ avatar.description }}</small></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </view-container>
</template>

<script setup lang="ts">
import ViewTitle from '../components/ViewTitle.vue'
import ViewContainer from '../components/ViewContainer.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { computed, inject, onMounted, ref, type Ref } from 'vue'
import type { UserAvatar } from '@solaris-common'
import { useStore, type Store } from 'vuex'
import type { State } from '@/store'
import { httpInjectionKey, isOk } from '@/services/typedapi'
import { getCredits, listMyAvatars, purchaseAvatar as reqPurchaseAvatar } from '@/services/typedapi/user'
import { makeConfirm } from '@/util/confirm';

const httpClient = inject(httpInjectionKey)!;
const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const isLoading = ref(false);
const userCredits: Ref<number | null> = ref(null);
const avatars: Ref<UserAvatar[]> = ref([]);

const sortedAvatars = computed(() => {
  return new Array(...avatars.value).sort((a, b) => Number(a.isPatronAvatar) - Number(b.isPatronAvatar));
});

const loadGalacticCredits = async () => {
  try {
    const response = await getCredits(httpClient)();

    if (isOk(response)) {
      userCredits.value = response.data.credits;
      store.commit('setUserCredits', response.data.credits);
    }
  } catch (err) {
    console.error(err)
  }
};

const loadAvatars = async () => {
  try {
    const response = await listMyAvatars(httpClient)();

    if (isOk(response)) {
      avatars.value = response.data.avatars;
    }
  } catch (err) {
    console.error(err);
  }
}

const purchaseAvatar = async (avatar: UserAvatar) => {
  if (avatar.purchased) {
    return
  }

  if (!(await confirm(`Purchase Avatar`, `Are you sure you want to purchase this avatar for ${avatar.price} credits?`))) {
    return
  }

  isLoading.value = true;

  try {
    const response = await reqPurchaseAvatar(httpClient)(avatar.id);

    if (isOk(response)) {
      avatar.purchased = true;
      userCredits.value! -= avatar.price;

      store.commit('setUserCredits', userCredits.value!);
    }
  } catch (err) {
    console.error(err)
  }

  isLoading.value = false;
}

const getAvatarImage = (avatar: UserAvatar) => {
  try {
    return new URL(`../../../../assets/avatars/${avatar.file}`, import.meta.url).href;
  } catch (err) {
    console.error(err);

    return undefined;
  }
}

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([loadAvatars(), loadGalacticCredits()]);
  isLoading.value = false;
})
</script>

<style scoped>
.linebreaks {
  white-space: break-spaces;
}
</style>
