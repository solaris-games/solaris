<template>
  <div class="row bg-dark pt-2 pb-2" v-if="userPlayer">
    <div class="col pe-0">
      <button class="btn btn-sm me-1" v-if="economy != null"
              :class="{'btn-success': availableCredits >= economy, 'btn-primary': availableCredits < economy}"
              :disabled="$isHistoricalMode() || isUpgradingEconomy || availableCredits < economy || isGameFinished"
              @click="upgradeEconomy"
              title="Upgrade economic infrastructure">
        <i class="fas fa-money-bill-wave me-1"></i>${{economy}}
      </button>
      <button class="btn btn-sm me-1" v-if="industry != null"
              :class="{'btn-success': availableCredits >= industry, 'btn-primary': availableCredits < industry}"
              :disabled="$isHistoricalMode() || isUpgradingIndustry || availableCredits < industry || isGameFinished"
              @click="upgradeIndustry"
              title="Upgrade industrial infrastructure">
        <i class="fas fa-tools me-1"></i>${{industry}}
      </button>
      <button class="btn btn-sm" v-if="science != null"
              :class="{'btn-success': availableCredits >= science, 'btn-primary': availableCredits < science}"
              :disabled="$isHistoricalMode() || isUpgradingScience || availableCredits < science || isGameFinished"
              @click="upgradeScience"
              title="Upgrade scientific infrastructure">
        <i class="fas fa-flask me-1"></i>${{science}}
      </button>
    </div>
    <div class="col-auto ps-0" v-if="userPlayer">
      <button v-if="canBuildWarpGates && !star.warpGate" :disabled="$isHistoricalMode() || userPlayer.credits < star.upgradeCosts.warpGate || isGameFinished" class="btn btn-sm btn-primary me-1" title="Build a warp gate - Grants x3 speed between warp gates" @click="confirmBuildWarpGate">
        <i class="fas fa-dungeon me-1"></i>${{star.upgradeCosts.warpGate}}
      </button>
      <button v-if="canDestroyWarpGates && star.warpGate" :disabled="$isHistoricalMode() || isGameFinished" class="btn btn-sm btn-outline-danger me-1" @click="confirmDestroyWarpGate" title="Destroy the warp gate">
        <i class="fas fa-dungeon"></i> <i class="fas fa-trash ms-1"></i>
      </button>
      <button :disabled="$isHistoricalMode() || userPlayer.credits < star.upgradeCosts.carriers || star.ships < 1 || isGameFinished" class="btn btn-sm btn-info" @click="onBuildCarrierRequested">
        <i class="fas fa-rocket me-1"></i>${{star.upgradeCosts.carriers}}
      </button>
    </div>
  </div>
</template>

<script>
import starService from '../../../../services/api/star'
import AudioService from '../../../../game/audio'
import GameHelper from '../../../../services/gameHelper'

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
      userPlayer: null,
      isUpgradingEconomy: false,
      isUpgradingIndustry: false,
      isUpgradingScience: false,
      canBuildWarpGates: false,
      canDestroyWarpGates: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.canBuildWarpGates = this.$store.state.game.settings.specialGalaxy.warpgateCost !== 'none'
    this.canDestroyWarpGates = this.$store.state.game.state.startDate != null
  },
  methods: {
    onBuildCarrierRequested () {
      this.$emit('onBuildCarrierRequested', this.star._id)
    },
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
    },
    async confirmBuildWarpGate (e) {
      if (!await this.$confirm('Build Warp Gate', `Are you sure you want build a Warp Gate at ${this.star.name}? The upgrade will cost $${this.star.upgradeCosts.warpGate}.`)) {
        return
      }

      try {
        let response = await starService.buildWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`Warp Gate built at ${this.star.name}.`)

          this.$store.commit('gameStarWarpGateBuilt', response.data)

          AudioService.join()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmDestroyWarpGate (e) {
      if (!await this.$confirm('Destroy Warp Gate', `Are you sure you want destroy Warp Gate at ${this.star.name}?`)) {
        return
      }

      try {
        let response = await starService.destroyWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`Warp Gate destroyed at ${this.star.name}.`)

          this.$store.commit('gameStarWarpGateDestroyed', {
            starId: this.star._id
          })

          AudioService.leave()
        }
      } catch (err) {
        console.error(err)
      }
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
