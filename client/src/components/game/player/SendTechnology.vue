<template>
<div class="row bg-primary pt-2 pb-2">
    <div class="col">
        <p class="mb-2">Give this player Technology. (Costs $15 per tech level)</p>

        <form>
            <div class="form-row">
                <div class="col-7">
                    <select class="form-control" id="technologySelection" v-model="selectedTechnology">
                        <option v-for="opt in availableTechnologies" v-bind:key="opt.name" v-bind:value="opt.name">
                            {{ opt.name }} ({{opt.level}} - ${{opt.cost}})
                        </option>
                    </select>
                </div>
                <div class="col-5">
                    <modalButton modalName="shareTechnologyModal" classText="btn btn-success btn-block">Share Technology</modalButton>
                </div>
            </div>
        </form>
    </div>

    <dialogModal modalName="shareTechnologyModal" titleText="Share Technology" cancelText="No" confirmText="Yes" @onConfirm="confirmSendTechnology">
      <p>Are you sure you want to share <b>{{selectedTechnology}}</b> with <b>{{player.alias}}</b>?</p>
    </dialogModal>
</div>
</template>

<script>
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'

export default {
  props: {
    game: Object,
    player: Object,
    userPlayer: Object
  },
  components: {
    'modalButton': ModalButton,
    'dialogModal': DialogModal
  },
  data() {
      // TODO: Get this data from the API.
      return {
          selectedTechnology: 'Scanning',
          availableTechnologies: [
          {
              name: 'Scanning',
              level: 2,
              cost: 30
          }
        ]
      }
  },
  methods: {
    confirmSendTechnology () {
      // TODO: Call the API
    }
  }
}
</script>

<style scoped>
</style>
