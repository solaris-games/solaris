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
export default {
  props: {
    availableCredits: Number,
    economy: Number,
    industry: Number,
    science: Number
  },
  methods: {
    upgradeEconomy () {
      this.$emit('onInfrastructureUpgraded', 'economy')
    },
    upgradeIndustry () {
      this.$emit('onInfrastructureUpgraded', 'industry')
    },
    upgradeScience () {
      this.$emit('onInfrastructureUpgraded', 'science')
    }
  }
}
</script>

<style scoped>
</style>
