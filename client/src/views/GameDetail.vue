<template>
  <view-container>
    <view-title title="Game Detail" navigation="main-menu"/>

    <view-subtitle v-bind:title="game.settings.general.name" class="mt-2"/>

    <p v-if="game.settings.general.description">{{game.settings.general.description}}</p>

    <div>
      <router-link to="/game/list" tag="button" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Return to List</router-link>
      <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success ml-1">Open Game <i class="fas fa-arrow-right"></i> </router-link>
    </div>
  </view-container>
</template>

<script>
import ViewTitle from '../components/ViewTitle'
import ViewSubtitle from '../components/ViewSubtitle'
import ViewContainer from '../components/ViewContainer'
import gameService from '../services/api/game'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle
  },
  data () {
    return {
      game: {
        _id: null,
        settings: {
          general: {
            name: null,
            description: null
          }
        }
      }
    }
  },
  created () {
    this.game._id = this.$route.query.id
  },
  async mounted () {
    try {
      let response = await gameService.getGameInfo(this.game._id)

      this.game = response.data
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style scoped>
</style>
