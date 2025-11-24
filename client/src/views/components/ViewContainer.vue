<template>
<div id="content">
    <view-container-top-bar v-if="!props.hideTopBar"/>
    <div class="container pb-3 col-xs-12 col-sm-10 col-md-10 col-lg-6">
        <slot></slot>
        <footer class="mt-3">
          <div class="row">
            <div class="col">
                <router-link :to="{ name: 'privacy-policy'}" class="me-2" title="Privacy Policy">
                  <i class="fas fa-file-alt"></i>
                </router-link>
                <a href="https://github.com/solaris-games/solaris" target="_blank" title="Code" class="me-2">
                  <i class="fab fa-github"></i>
                </a>
                <a href="https://store.steampowered.com/app/1623930/Solaris/" target="_blank" title="Steam" class="me-2">
                  <i class="fab fa-steam"></i>
                </a>
                <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" class="me-2">
                  <i class="fab fa-discord"></i>
                </a>
                <a href="https://steamcommunity.com/app/1623930/discussions/" target="_blank" title="Forum" class="me-2">
                  <i class="far fa-comments"></i>
                </a>
            </div>
            <div class="col-auto">
                <router-link :to="{ name: 'galactic-credits-shop'}" class="text-success"><i class="fas fa-shopping-basket me-1"></i>Shop</router-link>
                |
                <a href="https://www.redbubble.com/shop/ap/82527983" target="_blank" class="text-info"><i class="fas fa-tshirt me-1"></i>Swag</a>
            </div>
          </div>
        </footer>
    </div>
    <div class="mb-3 d-none d-md-block"></div>
</div>
</template>

<script setup lang="ts">
import ViewContainerTopBar from './ViewContainerTopBar.vue'
import {withMessages} from "../../util/messages";
import { useStore, type Store } from 'vuex';
import { onMounted } from 'vue';
import type {State} from "@/store";
import router from '@/router';

const props = defineProps<{
  isAuthPage: boolean,
  hideTopBar?: boolean
}>();

const store: Store<State> = useStore();

if (props.isAuthPage) {
  withMessages();
}

onMounted(async () => {
  if (props.isAuthPage && !store.state.userId) {
    const isOk = await store.dispatch('verify');

    if (!isOk) {
      router.push({ name: 'home' });
    }
  }
});
</script>

<style scoped>
#content {
  padding-top: 52px;
}
</style>
