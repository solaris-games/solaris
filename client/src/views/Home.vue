<template>
<div class="full-container">
  <view-container :hideTopBar="true" :isAuthPage="false">
    <view-title title="Welcome to Solaris" :hideHomeButton="true" :showSocialLinks="true" />

    <div class="row">
      <div class="col-sm-12 col-md-6 pb-3">
        <p>Discover a space strategy game filled with <span class="text-warning">conquest</span>, <span class="text-warning">betrayal</span> and <span class="text-warning">subterfuge</span>.</p>
        <p>Build alliances, make enemies and fight your way to victory to <span class="text-danger">galactic domination.</span></p>
        <p>Will <strong>you</strong> conquer the galaxy?</p>
        <a :href="documentationUrl" target="_blank">Learn more...</a>
      </div>
      <div class="col-sm-12 col-md-6">
        <h4>Login</h4>

        <loading-spinner :loading="isAutoLoggingIn"/>

        <account-login v-if="!isAutoLoggingIn"></account-login>
      </div>
    </div>

    <div class="row bg-dark">
      <div class="col text-center">
        <p class="mb-2 mt-2">Play <span class="text-warning">Solaris</span> on <a href="https://solaris.games" target="_blank" title="Web"><i class="fab fa-chrome me-1"></i>Web</a>, <a href="https://store.steampowered.com/app/1623930/Solaris/" target="_blank" title="Steam"><i class="fab fa-steam me-1"></i>Steam</a> and <a href="https://play.google.com/store/apps/details?id=com.voxel.solaris_android" target="_blank" title="Android"><i class="fab fa-google-play me-1"></i>Android</a>.</p>
      </div>
    </div>

    <latest-announcement />
  </view-container>

  <parallax />
</div>
</template>

<script setup lang="ts">
import ViewContainer from './components/ViewContainer.vue'
import ViewTitle from './components/ViewTitle.vue'
import AccountLogin from './account/components/Login.vue'
import router from '../router'
import LoadingSpinner from './components/LoadingSpinner.vue'
import Parallax from './components/Parallax.vue'
import LatestAnnouncement from "./components/LatestAnnouncement.vue";
import { ref, onMounted } from 'vue';
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";

const documentationUrl = import.meta.env.VUE_APP_DOCUMENTATION_URL;

const store: Store<State> = useStore();

const isAutoLoggingIn = ref(false);

onMounted(async () => {
  isAutoLoggingIn.value = true;

  if (await store.dispatch('verify')) {
    router.push({ name: 'main-menu' });
  }

  isAutoLoggingIn.value = false;
});
</script>

<style scoped>
.full-container {
  background-color: black !important;
}
</style>
