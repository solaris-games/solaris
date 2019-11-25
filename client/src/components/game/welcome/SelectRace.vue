<template>
<div>
    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2">Select an alien race to play.</p>
            <p class="mb-2">(Step 1 of 3)</p>
        </div>
    </div>

    <div class="row mt-2 no-gutters">
        <div class="col">
            <img :src="require(`../../../assets/avatars/240x320/${race}.jpg`)">
        </div>
        <div class="col pl-2 pt-2">
            <h4>Neo Sapians</h4>
            <p>Supposedly descended from apes, these late comers to the intergalactic congress are familiar with all types of advanced technologies. Having contributed little as a race and with no special talents to speak of, they are expert generalists.</p>
        </div>
    </div>

    <div class="row mt-2 mb-2">
        <div class="col">
            <button class="btn btn-info" @click="prevRace"><i class="fas fa-chevron-left"></i></button>
        </div>
        <div class="col text-right">
            <button class="btn btn-info" @click="nextRace"><i class="fas fa-chevron-right"></i></button>
        </div>
    </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      race: 38
    }
  },
  methods: {
    nextRace () {
      this.race++

      this.$emit('onRaceChanged', this.race)
    },
    prevRace () {
      this.race--

      this.$emit('onRaceChanged', this.race)
    }
  }
}
</script>

<style scoped>
</style>
