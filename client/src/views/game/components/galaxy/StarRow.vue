<template>
<tr>
    <td><player-icon v-if="star.ownedByPlayerId" :playerId="star.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td><i v-if="star.warpGate" class="fas fa-check"></i></td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-success me-2" title="Economic infrastructure - Contributes to credits earned at the end of a cycle">{{star.infrastructure.economy}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-warning me-2" title="Industrial infrastructure - Contributes to ship production">{{star.infrastructure.industry}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-info" title="Scientific infrastructure - Contributes to technology research">{{star.infrastructure.science}}</span>
    </td>
    <td class="text-end" v-if="isEconomyEnabled">
      <span v-if="hasEconomyCost && !canUpgradeEconomy">${{star.upgradeCosts.economy}}</span>
      <a href="javascript:;" v-if="hasEconomyCost && canUpgradeEconomy"
        @click="upgradeEconomy()" :disabled="$isHistoricalMode()">${{star.upgradeCosts.economy}}</a>
    </td>
    <td class="text-end" v-if="isIndustryEnabled">
      <span v-if="hasIndustryCost && !canUpgradeIndustry">${{star.upgradeCosts.industry}}</span>
      <a href="javascript:;" v-if="hasIndustryCost && canUpgradeIndustry"
        @click="upgradeIndustry()" :disabled="$isHistoricalMode()">${{star.upgradeCosts.industry}}</a>
    </td>
    <td class="text-end" v-if="isScienceEnabled">
      <span v-if="hasScienceCost && !canUpgradeScience">${{star.upgradeCosts.science}}</span>
      <a href="javascript:;" v-if="hasScienceCost && canUpgradeScience"
        @click="upgradeScience()" :disabled="$isHistoricalMode()">${{star.upgradeCosts.science}}</a>
    </td>
</tr>
</template>

<script>
import gameContainer from '../../../../game/container'
import AudioService from '../../../../game/audio'
import gameHelper from '../../../../services/gameHelper'
import PlayerIconVue from '../player/PlayerIcon.vue'
import starService from '../../../../services/api/star'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "../../../../eventBus";

export default {
  components: {
    'player-icon': PlayerIconVue,
    'specialist-icon': SpecialistIcon
  },
  props: {
    star: Object,
    allowUpgrades: Boolean
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      audio: null,
      isUpgradingEconomy: false,
      isUpgradingIndustry: false,
      isUpgradingScience: false
    }
  },
  methods: {
    clickStar (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    goToStar (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: this.star });
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
          this.$store.commit('gameStarEconomyUpgraded', response.data)

          this.$toast.default(`Economy upgraded at ${this.star.name}.`)

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
          this.$store.commit('gameStarIndustryUpgraded', response.data)

          this.$toast.default(`Industry upgraded at ${this.star.name}.`)

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
          this.$store.commit('gameStarScienceUpgraded', response.data)

          this.$toast.default(`Science upgraded at ${this.star.name}.`)

          AudioService.hover()
          gameContainer.reloadStar(this.star)
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingScience = false
    }
  },
  computed: {
    userPlayer() {
      return gameHelper.getUserPlayer(this.$store.state.game);
    },
    hasEconomyCost () {
      return this.star.upgradeCosts && this.star.upgradeCosts.economy
    },
    hasIndustryCost () {
      return this.star.upgradeCosts && this.star.upgradeCosts.industry
    },
    hasScienceCost () {
      return this.star.upgradeCosts && this.star.upgradeCosts.science
    },
    isEconomyEnabled: function () {
      return this.$store.state.game.settings.player.developmentCost.economy !== 'none'
    },
    isIndustryEnabled: function () {
      return this.$store.state.game.settings.player.developmentCost.industry !== 'none'
    },
    isScienceEnabled: function () {
      return this.$store.state.game.settings.player.developmentCost.science !== 'none'
    },
    canUpgradeEconomy () {
      return this.allowUpgrades && this.star.upgradeCosts && this.star.upgradeCosts.economy && !this.isUpgradingEconomy && this.userPlayer?.credits >= this.star.upgradeCosts.economy
    },
    canUpgradeIndustry () {
      return this.allowUpgrades && this.star.upgradeCosts && this.star.upgradeCosts.industry && !this.isUpgradingIndustry && this.userPlayer?.credits >= this.star.upgradeCosts.industry
    },
    canUpgradeScience () {
      return this.allowUpgrades && this.star.upgradeCosts && this.star.upgradeCosts.science && !this.isUpgradingScience && this.userPlayer?.credits >= this.star.upgradeCosts.science
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
