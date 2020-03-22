<template>
    <div class="row">
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block btn-success" @click="upgradeEconomy">Buy for ${{economy}}</button>
        </div>
        <div class="col text-center bg-primary pt-2 pb-2">
            <button class="btn btn-block btn-secondary" @click="upgradeIndustry">Buy for ${{industry}}</button>
        </div>
        <div class="col text-center bg-secondary pt-2 pb-2">
            <button class="btn btn-block btn-secondary" @click="upgradeScience">Buy for ${{science}}</button>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    economy: Number,
    industry: Number,
    science: Number,
  },
  methods: {
    upgradeEconomy() {
      this.$emit('onInfrastructureUpgraded', 'economy')
    },
    upgradeIndustry() {
      this.$emit('onInfrastructureUpgraded', 'industry')
    },
    upgradeScience() {
      this.$emit('onInfrastructureUpgraded', 'science')
    }
  }
}
</script>

<style scoped>
</style>
