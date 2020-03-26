<template>
<div class="row bg-secondary pt-2 pb-2">
    <div class="col">
        <form>
            <div class="form-row">
              <div class="col-7">
                  <p class="mb-2">{{userPlayer.renownToDistribute || 8}} Renown to distrubute.</p>
              </div>
              <div class="col-5">
                  <button class="btn btn-success btn-block" @click="confirmAwardRenown">Award Renown</button>
              </div>
            </div>
        </form>
    </div>
</div>
</template>

<script>
export default {
  props: {
    game: Object,
    player: Object,
    userPlayer: Object
  },
  methods: {
    confirmAwardRenown () {
      // TODO: Call the API
    }
  }
}
</script>

<style scoped>
</style>
