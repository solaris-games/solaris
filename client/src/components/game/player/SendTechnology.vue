<template>
<div class="row bg-primary pt-2 pb-2" v-if="selectedTechnology">
    <div class="col">
        <p class="mb-2">Give this player Technology. (Costs ${{getTradeCost()}} per tech level)</p>

        <form>
            <div class="form-row">
                <div class="col-7">
                    <select class="form-control" id="technologySelection" v-model="selectedTechnology" :disabled="!availableTechnologies.length">
                        <option v-for="opt in availableTechnologies" v-bind:key="opt.name + opt.level" v-bind:value="opt">
                            {{ getTechnologyFriendlyName(opt.name) }} {{opt.level}} (${{opt.cost}})
                        </option>
                    </select>
                </div>
                <div class="col-5">
                    <modalButton modalName="shareTechnologyModal" classText="btn btn-success btn-block" 
                      :disabled="!availableTechnologies.length || selectedTechnology.cost > userPlayer.credits">Share Technology</modalButton>
                </div>
            </div>
        </form>
    </div>

    <dialogModal modalName="shareTechnologyModal" titleText="Share Technology" cancelText="No" confirmText="Yes" @onConfirm="confirmSendTechnology">
      <p>Are you sure you want to share <b>{{selectedTechnology.name}}</b> (level {{selectedTechnology.level}}) with <b>{{player.alias}}</b>?</p>
    </dialogModal>
</div>
</template>

<script>
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'
import TradeApiService from '../../../services/api/trade'
import TechnologyHelper from '../../../services/technologyHelper'
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    playerId: String
  },
  components: {
    'modalButton': ModalButton,
    'dialogModal': DialogModal
  },
  data () {
    return {
      player: null,
      userPlayer: null,
      selectedTechnology: null,
      availableTechnologies: []
    }
  },
  mounted () {
    this.player = gameHelper.getPlayerById(this.$store.state.game, this.playerId)
    this.userPlayer = gameHelper.getUserPlayer(this.$store.state.game)

    this.getTradeableTechnologies()
  },
  methods: {
    getTechnologyFriendlyName (key) {
      return TechnologyHelper.getFriendlyName(key)
    },
    getTradeCost () {
      return this.$store.state.game.settings.player.tradeCost
    },
    async getTradeableTechnologies () {
      try {
        let response = await TradeApiService.getTradeableTechnologies(this.$store.state.game._id, this.player._id)

        if (response.status === 200) {
          this.availableTechnologies = response.data

          if (this.availableTechnologies.length) {
            this.selectedTechnology = this.availableTechnologies[0]
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmSendTechnology () {
      try {
        let response = await TradeApiService.sendTechnology(this.$store.state.game._id, this.player._id, this.selectedTechnology.name, this.selectedTechnology.level)

        if (response.status === 200) {
          this.$toasted.show(`Sent ${this.selectedTechnology.name} (level ${this.selectedTechnology.level}) to ${this.player.alias}.`)

          let playerTech = gameHelper.getPlayerById(this.$store.state.game, this.playerId).research[this.selectedTechnology.name]

          playerTech.level = this.selectedTechnology.level
          playerTech.effective = this.selectedTechnology.level
          
          gameHelper.getUserPlayer(this.$store.state.game).credits -= this.selectedTechnology.cost
          
          this.getTradeableTechnologies()
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
