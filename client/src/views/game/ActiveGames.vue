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
    <spectating-games/>
    <completed-games/>

  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ActiveGamesVue from './components/gameList/ActiveGames.vue'
import CompletedGamesVue from './components/gameList/CompletedGames.vue'
import SpectatingGamesVue from './components/gameList/SpectatingGames.vue'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'active-games': ActiveGamesVue,
    'completed-games': CompletedGamesVue,
    'spectating-games': SpectatingGamesVue
  },
  data () {
    return {
      showDonationBanner: Math.random() < 0.05
    }
  },
  methods: {
    closeDonationBanner () {
      this.showDonationBanner = false
    }
  }
}
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
