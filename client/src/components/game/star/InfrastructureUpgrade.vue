<template>
    <div class="row">
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block" 
              :class="{'btn-success': availableCredits >= economy, 'btn-secondary': availableCredits < economy}" 
              :disabled="availableCredits < economy" 
              @click="upgradeEconomy">Buy for ${{economy}}</button>
        </div>
        <div class="col text-center bg-primary pt-2 pb-2">
            <button class="btn btn-block" 
              :class="{'btn-success': availableCredits >= industry, 'btn-secondary': availableCredits < industry}" 
              :disabled="availableCredits < industry" 
              @click="upgradeIndustry">Buy for ${{industry}}</button>
        </div>
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block" 
              :class="{'btn-success': availableCredits >= science, 'btn-secondary': availableCredits < science}" 
              :disabled="availableCredits < science" 
              @click="upgradeScience">Buy for ${{science}}</button>
        </div>
    </div>
</template>

<script>
import ApiService from '../../../services/apiService'

export default {
  props: {
    gameId: String,
    starId: String,
    availableCredits: Number,
    economy: Number,
    industry: Number,
    science: Number
  },
  methods: {
    async upgradeEconomy (e) {
      try {
        let response = await ApiService.upgradeEconomy(this.gameId, this.starId);

        if (response.status == 200) {
          this.$emit('onInfrastructureUpgraded', 'economy')
        }
      } catch (err) {
        console.error(err)
      }
    },
    async upgradeIndustry (e) {
      try {
        let response = await ApiService.upgradeIndustry(this.gameId, this.starId);

        if (response.status == 200) {
          this.$emit('onInfrastructureUpgraded', 'industry')
        }
      } catch (err) {
        console.error(err)
      }
    },
    async upgradeScience (e) {
      try {
        let response = await ApiService.upgradeScience(this.gameId, this.starId);

        if (response.status == 200) {
          this.$emit('onInfrastructureUpgraded', 'science')
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
