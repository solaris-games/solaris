<template>
    <div class="position-static btn-group" v-if="canIgnoreEconomy || canIgnoreIndustry || canIgnoreScience">
        <button class="btn btn-sm dropdown-toggle"
            :class="{'btn-danger':highlightIgnoredInfrastructure && getInfrastructureIgnoreStatus(highlightIgnoredInfrastructure),
                     'btn-outline-success':highlightIgnoredInfrastructure && !getInfrastructureIgnoreStatus(highlightIgnoredInfrastructure)}"
            type="button" data-bs-toggle="dropdown" data-boundary="viewport" aria-haspopup="true" aria-expanded="false">
            <i class="fas me-1" :class="{'fa-ban':isAllIgnored,'fa-check-double':isAllIncluded,'fa-check':!isAllIgnored && !isAllIncluded}"></i>
        </button>
        <div class="dropdown-menu">
            <h6 class="dropdown-header">Bulk Upgrade</h6>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('economy')" v-if="canIgnoreEconomy">
                <i class="fas me-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('economy'), 'fa-check': !getInfrastructureIgnoreStatus('economy')}"></i>
                Economy
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('industry')" v-if="canIgnoreIndustry">
                <i class="fas me-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('industry'), 'fa-check': !getInfrastructureIgnoreStatus('industry')}"></i>
                Industry
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnore('science')" v-if="canIgnoreScience">
                <i class="fas me-1" :class="{'fa-ban': getInfrastructureIgnoreStatus('science'), 'fa-check': !getInfrastructureIgnoreStatus('science')}"></i>
                Science
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnoreAll(true)">
                <i class="fas fa-ban me-1"></i>
                Ignore All
            </a>
            <a class="dropdown-item" href="javascript:;" @click="toggleBulkIgnoreAll(false)">
                <i class="fas fa-check me-1"></i>
                Include All
            </a>
        </div>
    </div>
</template>

<script>
import starService from '../../../../services/api/star'
import GameHelper from '../../../../services/gameHelper'
import GameContainer from '../../../../game/container'
import { inject } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";

export default {
  components: {

  },
  props: {
    starId: String,
    highlightIgnoredInfrastructure: String
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  methods: {
    triggerChanged () {
      this.$emit("bulkIgnoreChanged", {
        starId: this.starId
      });
      const star = GameHelper.getStarById(this.$store.state.game, this.starId);
      this.eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    async toggleBulkIgnore (infrastructureType) {
      try {
        let response = await starService.toggleIgnoreBulkUpgrade(this.$store.state.game._id, this.star._id, infrastructureType)

        if (response.status === 200) {
          this.star.ignoreBulkUpgrade[infrastructureType] = !this.star.ignoreBulkUpgrade[infrastructureType]

          if (this.star.ignoreBulkUpgrade[infrastructureType]) {
            this.$toast.default(`${this.star.name} ${infrastructureType} is now ignored by Bulk Upgrade.`)
          } else {
            this.$toast.default(`${this.star.name} ${infrastructureType} is now included in Bulk Upgrade.`)
          }

          this.triggerChanged();
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
            this.$toast.default(`${this.star.name} is now ignored by Bulk Upgrade.`)
          } else {
            this.$toast.default(`${this.star.name} is now included in Bulk Upgrade.`)
          }

          this.triggerChanged();
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
    canIgnoreEconomy: function () {
      return this.$store.state.game.settings.player.developmentCost.economy !== 'none'
    },
    canIgnoreIndustry: function () {
      return this.$store.state.game.settings.player.developmentCost.industry !== 'none'
    },
    canIgnoreScience: function () {
      return this.$store.state.game.settings.player.developmentCost.science !== 'none'
    },
    isAllIgnored: function () {
        return (!this.canIgnoreEconomy || this.getInfrastructureIgnoreStatus('economy'))
            && (!this.canIgnoreIndustry || this.getInfrastructureIgnoreStatus('industry'))
            && (!this.canIgnoreScience || this.getInfrastructureIgnoreStatus('science'))
    },
    isAllIncluded: function () {
        return (!this.canIgnoreEconomy || !this.getInfrastructureIgnoreStatus('economy'))
            && (!this.canIgnoreIndustry || !this.getInfrastructureIgnoreStatus('industry'))
            && (!this.canIgnoreScience || !this.getInfrastructureIgnoreStatus('science'))
    }
  }
}
</script>

<style scoped>
</style>
