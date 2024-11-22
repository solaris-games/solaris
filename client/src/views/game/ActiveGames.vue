<template>
  <view-container :is-auth-page="true">
    <view-title title="My Games" />

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
  }
}
</script>

<style scoped>
</style>
