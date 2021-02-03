<template>
<tr>
    <td><i class="fas fa-circle" v-if="star.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-right">
      <span v-if="star.infrastructure" class="text-success mr-2" title="Economy">{{star.infrastructure.economy}}</span>
      <span v-if="star.infrastructure" class="text-warning mr-2" title="Industry">{{star.infrastructure.industry}}</span>
      <span v-if="star.infrastructure" class="text-info" title="Science">{{star.infrastructure.science}}</span>
    </td>
    <!-- <td class="text-right"><span v-if="star.infrastructure">{{star.infrastructure.economy}}</span></td>
    <td class="text-right"><span v-if="star.infrastructure">{{star.infrastructure.industry}}</span></td>
    <td class="text-right"><span v-if="star.infrastructure">{{star.infrastructure.science}}</span></td> -->
    <td class="text-right">
      <span v-if="star.upgradeCosts && !canUpgradeEconomy">${{star.upgradeCosts.economy}}</span>
      <a href="javascript:;" v-if="canUpgradeEconomy"
        @click="upgradeEconomy()">${{star.upgradeCosts.economy}}</a>
    </td>
    <td class="text-right">
      <span v-if="star.upgradeCosts && !canUpgradeIndustry">${{star.upgradeCosts.industry}}</span>
      <a href="javascript:;" v-if="canUpgradeIndustry"
        @click="upgradeIndustry()">${{star.upgradeCosts.industry}}</a>
    </td>
    <td class="text-right">
      <span v-if="star.upgradeCosts && !canUpgradeScience">${{star.upgradeCosts.science}}</span>
      <a href="javascript:;" v-if="canUpgradeScience"
        @click="upgradeScience()">${{star.upgradeCosts.science}}</a>
    </td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'
import AudioService from '../../../game/audio'
import gameHelper from '../../../services/gameHelper'
import starService from '../../../services/api/star'
import SpecialistIcon from '../specialist/SpecialistIcon'

export default {
  components: {
    'specialist-icon': SpecialistIcon
  },
  props: {
    star: Object,
    allowUpgrades: Boolean
  },
  data () {
    return {
      audio: null,
      availableCredits: 0,
      isUpgradingEconomy: false,
      isUpgradingIndustry: false,
      isUpgradingScience: false
    }
  },
  mounted () {
    this.refreshCredits()
  },
  methods: {
    getColour () {
      return gameHelper.getPlayerColour(this.$store.state.game, this.star.ownedByPlayerId)
    },
    clickStar (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    goToStar (e) {
      gameContainer.map.panToStar(this.star)
    },
    refreshCredits () {
      this.availableCredits = gameHelper.getUserPlayer(this.$store.state.game).credits
    },
    onInfrastructureUpgraded (infrastructure, data) {
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)

      userPlayer.credits -= data.cost

      if (data.currentResearchTicksEta != null) {
        userPlayer.currentResearchTicksEta = data.currentResearchTicksEta
      }

      this.star.upgradeCosts[infrastructure] = data.nextCost
      this.star.infrastructure[infrastructure] = data.infrastructure

      if (data.manufacturing) {
        this.star.manufacturing = +data.manufacturing.toFixed(2)
      }

      this.$emit('onInfrastructureUpgraded', {
        infrastructureKey: infrastructure,
        data: data
      })

      AudioService.hover()
      gameContainer.reloadStar(this.star)
      this.refreshCredits()
    },
    async upgradeEconomy (e) {
      try {
        this.isUpgradingEconomy = true

        let response = await starService.upgradeEconomy(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.onInfrastructureUpgraded('economy', response.data)

          this.$toasted.show(`Economy upgraded at ${this.star.name}.`)
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
          this.onInfrastructureUpgraded('industry', response.data)

          this.$toasted.show(`Industry upgraded at ${this.star.name}.`)
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
          this.onInfrastructureUpgraded('science', response.data)

          this.$toasted.show(`Science upgraded at ${this.star.name}.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingScience = false
    }
  },
  computed: {
    canUpgradeEconomy () {
      return this.allowUpgrades && this.star.upgradeCosts && !this.isUpgradingEconomy && gameHelper.getUserPlayer(this.$store.state.game).credits >= this.star.upgradeCosts.economy
    },
    canUpgradeIndustry () {
      return this.allowUpgrades && this.star.upgradeCosts && !this.isUpgradingIndustry && gameHelper.getUserPlayer(this.$store.state.game).credits >= this.star.upgradeCosts.industry
    },
    canUpgradeScience () {
      return this.allowUpgrades && this.star.upgradeCosts && !this.isUpgradingScience && gameHelper.getUserPlayer(this.$store.state.game).credits >= this.star.upgradeCosts.science
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

td.no-padding {
  padding: 12px 0px !important;
}

td.sm-padding {
  padding: 12px 3px !important;
}
</style>
