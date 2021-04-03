<template>
    <div class="row">
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block"
              :class="{'btn-success': availableCredits >= economy, 'btn-secondary': availableCredits < economy}"
              :disabled="$isHistoricalMode() || isUpgradingEconomy || availableCredits < economy || isGameFinished"
              @click="upgradeEconomy"><small>Buy for ${{economy}}</small></button>
        </div>
        <div class="col text-center bg-primary pt-2 pb-2">
            <button class="btn btn-block"
              :class="{'btn-success': availableCredits >= industry, 'btn-secondary': availableCredits < industry}"
              :disabled="$isHistoricalMode() || isUpgradingIndustry || availableCredits < industry || isGameFinished"
              @click="upgradeIndustry"><small>Buy for ${{industry}}</small></button>
        </div>
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block"
              :class="{'btn-success': availableCredits >= science, 'btn-secondary': availableCredits < science}"
              :disabled="$isHistoricalMode() || isUpgradingScience || availableCredits < science || isGameFinished"
              @click="upgradeScience"><small>Buy for ${{science}}</small></button>
        </div>
    </div>
</template>

<script>
import starService from '../../../services/api/star'
import GameHelper from '../../../services/gameHelper'
import AudioService from '../../../game/audio'

export default {
  props: {
    star: Object,
    availableCredits: Number,
    economy: Number,
    industry: Number,
    science: Number
  },
  data () {
    return {
      data: null,
      isUpgradingEconomy: false,
      isUpgradingIndustry: false,
      isUpgradingScience: false
    }
  },
  methods: {
    async upgradeEconomy (e) {
      try {
        this.isUpgradingEconomy = true

        let response = await starService.upgradeEconomy(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Economy upgraded at ${this.star.name}.`)

          this.$store.commit('gameStarEconomyUpgraded', response.data)
          
          AudioService.hover()
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingEconomy = false
    },
    async upgradeIndustry (e) {
      try {
        this.isUpgradingIndustry = true

        let response = await starService.upgradeIndustry(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Industry upgraded at ${this.star.name}.`)

          this.$store.commit('gameStarIndustryUpgraded', response.data)
          
          AudioService.hover()
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingIndustry = false
    },
    async upgradeScience (e) {
      try {
        this.isUpgradingScience = true

        let response = await starService.upgradeScience(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Science upgraded at ${this.star.name}.`)

          this.$store.commit('gameStarScienceUpgraded', response.data)
          
          AudioService.hover()
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingScience = false
    }
  },
  computed: {
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
