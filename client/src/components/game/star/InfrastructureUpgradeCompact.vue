<template>
  <div class="row bg-secondary pt-2 pb-2">
    <div class="col">
      <button class="btn btn-sm mr-1"
              :class="{'btn-success': availableCredits >= economy, 'btn-primary': availableCredits < economy}"
              :disabled="isUpgradingEconomy || availableCredits < economy"
              @click="upgradeEconomy"
              title="Upgrade Economy">
        <i class="fas fa-money-bill-wave"></i> ${{economy}}
      </button>
      <button class="btn btn-sm mr-1"
              :class="{'btn-success': availableCredits >= industry, 'btn-primary': availableCredits < industry}"
              :disabled="isUpgradingIndustry || availableCredits < industry"
              @click="upgradeIndustry"
              title="Upgrade Industry">
        <i class="fas fa-tools"></i> ${{industry}}
      </button>
      <button class="btn btn-sm mr-1"
              :class="{'btn-success': availableCredits >= science, 'btn-primary': availableCredits < science}"
              :disabled="isUpgradingScience || availableCredits < science"
              @click="upgradeScience"
              title="Upgrade Science">
        <i class="fas fa-flask"></i> ${{science}}
      </button>
      <button :disabled="userPlayer.credits < star.upgradeCosts.carriers || star.garrison < 1" class="btn btn-sm btn-info mr-1" @click="confirmBuildCarrier">
        <i class="fas fa-rocket"></i> ${{star.upgradeCosts.carriers}}
      </button>
    </div>
    <div class="col-auto" v-if="userPlayer">
      <button v-if="canBuildWarpGates && !star.warpGate" :disabled="userPlayer.credits < star.upgradeCosts.warpGate" class="btn btn-sm btn-primary mr-1" title="Build a Warp Gate" @click="confirmBuildWarpGate">
        <i class="fas fa-dungeon"></i> ${{star.upgradeCosts.warpGate}}
      </button>
      <button v-if="canBuildWarpGates && star.warpGate" class="btn btn-sm btn-danger mr-1" @click="confirmDestroyWarpGate" title="Destroy Warp Gate">
        <i class="fas fa-trash"></i> <i class="fas fa-dungeon ml-1"></i>
      </button>

      <button class="btn btn-sm btn-danger" @click="confirmAbandonStar" title="Abandon Star">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </div>
</template>

<script>
import starService from '../../../services/api/star'
import AudioService from '../../../game/audio'
import GameHelper from '../../../services/gameHelper'

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
      canBuildWarpGates: false
    }
  },
  mounted () {
    this.audio = new AudioService(this.$store)

    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.canBuildWarpGates = this.$store.state.game.settings.specialGalaxy.warpgateCost !== 'none'
  },
  methods: {
    async upgradeEconomy (e) {
      try {
        this.isUpgradingEconomy = true

        let response = await starService.upgradeEconomy(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Economy upgraded at ${this.star.name}.`)

          this.$emit('onInfrastructureUpgraded', {
            infrastructureKey: 'economy',
            data: response.data
          })

          this.audio.hover()
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

          this.$emit('onInfrastructureUpgraded', {
            infrastructureKey: 'industry',
            data: response.data
          })

          this.audio.hover()
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

          this.$emit('onInfrastructureUpgraded', {
            infrastructureKey: 'science',
            data: response.data
          })

          this.audio.hover()
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingScience = false
    },
    async confirmBuildWarpGate (e) {
      if (!confirm(`Are you sure you want build a Warp Gate at ${this.star.name}? The upgrade will cost $${this.star.upgradeCosts.warpGate}.`)) {
        return
      }

      try {
        let response = await starService.buildWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Warp Gate built at ${this.star.name}.`)

          GameHelper.getUserPlayer(this.$store.state.game).credits -= response.data.cost

          this.audio.join()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmDestroyWarpGate (e) {
      if (!confirm(`Are you sure you want destroy Warp Gate at ${this.star.name}?`)) {
        return
      }

      try {
        let response = await starService.destroyWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Warp Gate destroyed at ${this.star.name}.`)

          this.audio.leave()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmAbandonStar (e) {
      if (!confirm(`Are you sure you want to abandon ${this.star.name}? It's Economy, Industry and Science will remain, but all ships at this star will be destroyed.`)) {
        return
      }

      try {
        let response = await starService.abandonStar(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`${this.star.name} has been abandoned.`)

          this.audio.leave()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmBuildCarrier (e) {
      if (!confirm(`Are you sure you want build a Carrier at ${this.star.name}? The carrier will cost ${this.star.upgradeCosts.carriers}.`)) {
        return
      }

      try {
        // Build the carrier with the entire star garrison.
        let ships = this.star.garrison

        let response = await starService.buildCarrier(this.$store.state.game._id, this.star._id, ships)

        if (response.status === 200) {
          this.$toasted.show(`Carrier built at ${this.star.name}.`)

          this.$store.state.game.galaxy.carriers.push(response.data.carrier)

          let star = GameHelper.getStarById(this.$store.state.game, response.data.carrier.orbiting).garrison = response.data.starGarrison

          this.$emit('onEditWaypointsRequested', response.data.carrier._id)
          this.userPlayer.credits -= this.star.upgradeCosts.carriers

          this.audio.join()
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
