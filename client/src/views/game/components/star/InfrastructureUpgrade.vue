<template>
    <div class="row" v-if="economy != null || industry != null || science != null">
        <div class="col text-center pt-2 pb-2">
          <div class="d-grid gap-2">
            <button class="btn" v-if="economy != null"
              :class="{'btn-success': availableCredits >= economy, 'btn-secondary': availableCredits < economy}"
              :disabled="$isHistoricalMode() || isUpgradingEconomy || availableCredits < economy || isGameFinished"
              @click="upgradeEconomy"><small>Buy for ${{economy}}</small></button>
          </div>
        </div>
        <div class="col text-center bg-dark pt-2 pb-2">
          <div class="d-grid gap-2">
            <button class="btn" v-if="industry != null"
              :class="{'btn-success': availableCredits >= industry, 'btn-secondary': availableCredits < industry}"
              :disabled="$isHistoricalMode() || isUpgradingIndustry || availableCredits < industry || isGameFinished"
              @click="upgradeIndustry"><small>Buy for ${{industry}}</small></button>
          </div>
        </div>
        <div class="col text-center pt-2 pb-2">
          <div class="d-grid gap-2">
            <button class="btn" v-if="science != null"
              :class="{'btn-success': availableCredits >= science, 'btn-secondary': availableCredits < science}"
              :disabled="$isHistoricalMode() || isUpgradingScience || availableCredits < science || isGameFinished"
              @click="upgradeScience"><small>Buy for ${{science}}</small></button>
          </div>
        </div>
    </div>
</template>

<script>
import starService from '../../../../services/api/star'
import GameHelper from '../../../../services/gameHelper'
import AudioService from '../../../../game/audio'

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
      if (this.$store.state.settings.star.confirmBuildEconomy === 'enabled'
        && !await this.$confirm('Upgrade Economy', `Are you sure you want to upgrade Economy at ${this.star.name} for $${this.star.upgradeCosts.economy} credits?`)) {
        return
      }

      try {
        this.isUpgradingEconomy = true

        let response = await starService.upgradeEconomy(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`Economy upgraded at ${this.star.name}.`)

          this.$store.commit('gameStarEconomyUpgraded', response.data)

          AudioService.hover()
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingEconomy = false
    },
    async upgradeIndustry (e) {
      if (this.$store.state.settings.star.confirmBuildIndustry === 'enabled'
        && !await this.$confirm('Upgrade Industry', `Are you sure you want to upgrade Industry at ${this.star.name} for $${this.star.upgradeCosts.industry} credits?`)) {
        return
      }

      try {
        this.isUpgradingIndustry = true

        let response = await starService.upgradeIndustry(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`Industry upgraded at ${this.star.name}.`)

          this.$store.commit('gameStarIndustryUpgraded', response.data)

          AudioService.hover()
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingIndustry = false
    },
    async upgradeScience (e) {
      if (this.$store.state.settings.star.confirmBuildScience === 'enabled'
        && !await this.$confirm('Upgrade Science', `Are you sure you want to upgrade Science at ${this.star.name} for $${this.star.upgradeCosts.science} credits?`)) {
        return
      }

      try {
        this.isUpgradingScience = true

        let response = await starService.upgradeScience(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`Science upgraded at ${this.star.name}.`)

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
