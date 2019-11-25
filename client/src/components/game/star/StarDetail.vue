<template>
<div class="container bg-secondary">
    <h3 class="pt-2">{{star.data.name}}</h3>

    <p v-if="star.data.ownedByPlayerId == currentPlayerId">A star under your command</p>
    <p v-if="star.data.ownedByPlayerId != null && star.data.ownedByPlayerId != currentPlayerId">This star is controlled by [{{getStarOwningPlayer().alias}}]</p>
    <p v-if="star.data.ownedByPlayerId == null">This star has not been claimed by any faction. Send a carrier here to claim it for yourself</p>

    <div v-if="star.data.garrison" class="row mb-2 pt-2 pb-2 bg-primary">
        <div class="col">
            Ships
        </div>
        <div class="col text-right">
            {{star.data.garrison}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.naturalResources" class="row pt-1 pb-1">
        <div class="col">
            Natural Resources
        </div>
        <div class="col text-right">
            {{star.data.naturalResources}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.terraformedResources" class="row mb-2 pt-1 pb-1">
        <div class="col">
            Terraformed Resources
        </div>
        <div class="col text-right">
            {{star.data.terraformedResources}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <h4>Infrastructure</h4>
</div>
</template>

<script>
export default {
  components: {

  },
  props: {
    game: Object,
    star: Object
  },
  data () {
    return {
      currentPlayerId: this.getUserPlayer()._id
    }
  },
  methods: {
    getUserPlayer () {
      return this.game.galaxy.players.find(x => x.userId === this.$store.state.userId)
    },
    getStarOwningPlayer () {
      return this.game.galaxy.players.find(x => x._id === this.star.data.ownedByPlayerId)
    }
  }
}
</script>

<style scoped>
</style>
