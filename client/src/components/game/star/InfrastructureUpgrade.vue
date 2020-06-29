<template>
    <div class="row">
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block" 
              :class="{'btn-success': availableCredits >= economy, 'btn-secondary': availableCredits < economy}" 
              :disabled="isUpgradingEconomy || availableCredits < economy" 
              @click="upgradeEconomy">Buy for ${{economy}}</button>
        </div>
        <div class="col text-center bg-primary pt-2 pb-2">
            <button class="btn btn-block" 
              :class="{'btn-success': availableCredits >= industry, 'btn-secondary': availableCredits < industry}" 
              :disabled="isUpgradingIndustry || availableCredits < industry" 
              @click="upgradeIndustry">Buy for ${{industry}}</button>
        </div>
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block" 
              :class="{'btn-success': availableCredits >= science, 'btn-secondary': availableCredits < science}" 
              :disabled="isUpgradingScience || availableCredits < science" 
              @click="upgradeScience">Buy for ${{science}}</button>
        </div>
    </div>
</template>

<script>
import starService from '../../../services/api/star'

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
          this.$emit('onInfrastructureUpgraded', {
            infrastructureKey: 'economy',
            data: response.data
          })
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
          this.$emit('onInfrastructureUpgraded', {
            infrastructureKey: 'industry',
            data: response.data
          })
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
          this.$emit('onInfrastructureUpgraded', {
            infrastructureKey: 'science',
            data: response.data
          })
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgradingScience = false
    }
  }
}
</script>

<style scoped>
</style>
