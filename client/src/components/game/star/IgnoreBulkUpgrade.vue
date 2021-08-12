<template>
    <div class="btn-group">
        <button class="btn btn-secondary btn-sm dropdown-toggle"
            :class="{'btn-danger':highlightIgnoredInfrastructure && getInfrastructureIgnoreStatus(highlightIgnoredInfrastructure),
                     'btn-success':highlightIgnoredInfrastructure && !getInfrastructureIgnoreStatus(highlightIgnoredInfrastructure)}"
            type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fas mr-1" :class="{'fa-ban':isAllIgnored,'fa-check-double':isAllIncluded,'fa-check':!isAllIgnored && !isAllIncluded}"></i>
        </button>
        <div class="dropdown-menu">
            <h6 class="dropdown-header">Bulk Upgrade</h6>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('economy')">
                <i class="fas mr-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('economy'), 'fa-check': !getInfrastructureIgnoreStatus('economy')}"></i>
                Economy
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('industry')">
                <i class="fas mr-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('industry'), 'fa-check': !getInfrastructureIgnoreStatus('industry')}"></i>
                Industry
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('science')">
                <i class="fas mr-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('science'), 'fa-check': !getInfrastructureIgnoreStatus('science')}"></i>
                Science
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnoreAll(true)">
                <i class="fas fa-ban mr-1"></i>
                Ignore All
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnoreAll(false)">
                <i class="fas fa-check mr-1"></i>
                Include All
            </a>
        </div>
    </div>
</template>

<script>
import starService from '../../../services/api/star'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {

  },
  props: {
    starId: String,
    highlightIgnoredInfrastructure: String
  },
  methods: {
    async toggleBulkIgnore (infrastructureType) {
      try {
        let response = await starService.toggleIgnoreBulkUpgrade(this.$store.state.game._id, this.star._id, infrastructureType)
        
        if (response.status === 200) {
          this.star.ignoreBulkUpgrade[infrastructureType] = !this.star.ignoreBulkUpgrade[infrastructureType]

          if (this.star.ignoreBulkUpgrade[infrastructureType]) {
            this.$toasted.show(`${this.star.name} ${infrastructureType} is now ignored by Bulk Upgrade.`)
          } else {
            this.$toasted.show(`${this.star.name} ${infrastructureType} is now included in Bulk Upgrade.`)
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    async toggleBulkIgnoreAll (ignoreStatus) {
      try {
        let response = await starService.toggleIgnoreBulkUpgradeAll(this.$store.state.game._id, this.star._id, ignoreStatus)
        
        if (response.status === 200) {
          this.star.ignoreBulkUpgrade['economy'] = ignoreStatus
          this.star.ignoreBulkUpgrade['industry'] = ignoreStatus
          this.star.ignoreBulkUpgrade['science'] = ignoreStatus

          if (ignoreStatus) {
            this.$toasted.show(`${this.star.name} is now ignored by Bulk Upgrade.`)
          } else {
            this.$toasted.show(`${this.star.name} is now included in Bulk Upgrade.`)
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    getInfrastructureIgnoreStatus(infrastructureType) {
        return this.star.ignoreBulkUpgrade[infrastructureType]
    }
  },
  computed: {
    star: function () {
      return GameHelper.getStarById(this.$store.state.game, this.starId)
    },
    isAllIgnored: function () {
        return this.getInfrastructureIgnoreStatus('economy')
            && this.getInfrastructureIgnoreStatus('industry')
            && this.getInfrastructureIgnoreStatus('science')
    },
    isAllIncluded: function () {
        return !this.getInfrastructureIgnoreStatus('economy')
            && !this.getInfrastructureIgnoreStatus('industry')
            && !this.getInfrastructureIgnoreStatus('science')
    }
  }
}
</script>

<style scoped>
</style>
