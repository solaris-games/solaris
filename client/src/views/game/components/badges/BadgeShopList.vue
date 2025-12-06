<template>
<div>
    <div class="row" v-for="badge in badges" :key="badge.key">
        <div class="col-auto">
            <img :src="getBadgeSrc(badge)" :alt="badge.name"/>

            <div class="d-grid gap-2">
                <button class="btn btn-sm btn-success" v-if="userCredits >= badge.price" @click="purchaseBadge(badge)">
                    <i class="fas fa-shopping-basket"></i> {{badge.price}} Credit<span v-if="badge.price > 1">s</span>
                </button>
            </div>
            <div class="d-grid gap-2">
                <router-link :to="{ name: 'galactic-credits-shop'}" class="btn btn-sm btn-outline-danger" v-if="userCredits < badge.price">
                    <i class="fas fa-coins"></i> {{badge.price}} Credit<span v-if="badge.price > 1">s</span>
                </router-link>
            </div>
        </div>
        <div class="col">
            <h5>{{badge.name}}</h5>
            <p><small>{{badge.description}}</small></p>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import {makeConfirm} from "@/util/confirm";
import type {Badge} from "@solaris-common";

const props = defineProps<{
  badges: Badge[],
  userCredits: number,
  recipientName: string,
}>();

const emit = defineEmits<{
  onPurchaseBadgeConfirmed: [badge: Badge],
}>();

const store = useStore();
const confirm = makeConfirm(store);

const purchaseBadge = async (badge: Badge) => {
  if (!await confirm(`Purchase Badge`, `Are you sure you want to purchase the '${badge.name}' badge for ${props.recipientName}? It will cost ${badge.price} credit(s).`)) {
    return;
  }

  emit('onPurchaseBadgeConfirmed', badge);
};

const getBadgeSrc = (badge: Badge) => {
  return new URL(`../../../../assets/badges/${badge.key}.png`, import.meta.url).href;
};
</script>

<style scoped>
img {
    width: 128px;
    height: 128px;
}
</style>
