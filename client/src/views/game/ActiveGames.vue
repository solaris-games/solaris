<template>
  <view-container :is-auth-page="true">
    <view-title title="My Games" />

    <div v-if="showDonationBanner" class="row bg-secondary border-2 mb-4 p-1 support-banner" title="Support the project">
      <p class="support-text">
        Solaris is free, open source and does not have ads. Please consider donating or purchasing Galactic Credits to support the continued development of the project.
      </p>

      <p class="support-buttons">
        <a class="btn btn-success" href="https://www.buymeacoffee.com/limitingfactor" target="_blank">Donate</a>
        <a class="btn btn-primary" href="javascript:;" @click="closeDonationBanner">Dismiss</a>
      </p>
    </div>

    <active-games/>
    <hr/>
    <open-games />
    <spectating-games/>
    <completed-games/>

  </view-container>
</template>

<script setup lang="ts">
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ActiveGames from './components/gameList/ActiveGames.vue'
import CompletedGames from './components/gameList/CompletedGames.vue'
import SpectatingGames from './components/gameList/SpectatingGames.vue'
import OpenGames from "@/views/game/components/gameList/OpenGames.vue";
import { ref } from 'vue';

const showDonationBanner = ref(Math.random() < 0.05);

const closeDonationBanner = () => showDonationBanner.value = false;
</script>

<style scoped>
.support-banner {
  border-radius: 4px;
}

.support-text {
  color: white;
  white-space: pre-line;
}

.support-buttons {
  display: flex;
  justify-content: right;
  gap: 8px;
}
</style>
