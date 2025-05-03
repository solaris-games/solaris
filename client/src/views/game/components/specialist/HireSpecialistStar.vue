<template>
<div class="menu-page container">
    <menu-title title="Hire Specialist" @onCloseRequested="onCloseRequested">
      <button @click="onOpenStarDetailRequested(star)" class="btn btn-sm btn-outline-primary" title="Back to Star"><i class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row">
        <div class="col">
            <h4 class="mt-2">Star</h4>
        </div>
    </div>

    <div class="row mb-2 pt-1 pb-1 bg-dark" v-if="star">
        <div class="col">
            <a href="javascript:;" @click="onOpenStarDetailRequested(star)"><i class="fas fa-star"></i> {{star.name}}</a>
        </div>
        <div class="col-auto">
            {{star.ships}} <i class="fas fa-rocket ms-1"></i>
        </div>
    </div>

    <div v-if="specialists && specialists.length">
        <div v-for="specialist in specialists" :key="specialist.id" class="row mb-2 pt-1 pb-1 ">
            <div class="col mt-2">
                <h5 class="pt-1 text-warning">
                    <specialist-icon :type="'star'" :defaultIcon="'star'" :specialist="specialist"/>
                    <span class="ms-1">{{specialist.name}}</span>
                </h5>
            </div>
            <div class="col-auto mt-2">
                <button class="btn btn-sm btn-success" v-if="!(star.specialistId && star.specialist.id === specialist.id)" :disabled="$isHistoricalMode() || isHiringSpecialist || cantAffordSpecialist(specialist) || isCurrentSpecialistOneShot" @click="hireSpecialist(specialist)">
                  <i class="fas fa-coins"></i>
                  Hire for {{getSpecialistActualCostString(specialist)}}
                </button>
                <span class="badge bg-primary" v-if="star.specialistId && star.specialist.id === specialist.id">Active</span>
            </div>
            <div class="col-12 mt-2">
                <p>{{specialist.description}}</p>
                <p v-if="specialist.oneShot" class="text-warning"><small>This specialist cannot be replaced.</small></p>
                <p v-if="specialist.expireTicks" class="text-warning"><small>This specialist expires after {{specialist.expireTicks}} ticks.</small></p>
            </div>
        </div>
    </div>

    <p v-if="specialists && !specialists.length" class="text-center pb-2">No specialists available to hire.</p>
</div>
</template>

<script>
import MenuTitleVue from '../MenuTitle.vue'
import GameHelper from '../../../../services/gameHelper'
import SpecialistApiService from '../../../../services/api/specialist'
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import { inject } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";

export default {
  components: {
    'menu-title': MenuTitleVue,
    'specialist-icon': SpecialistIconVue
  },
  props: {
      starId: String
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      specialists: [],
      isHiringSpecialist: false
    }
  },
  mounted () {
    const banList = this.$store.state.game.settings.specialGalaxy.specialistBans.star

    this.specialists = this.$store.state.starSpecialists.filter(s => banList.indexOf(s.id) < 0)
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenStarDetailRequested (star) {
      this.$emit('onOpenStarDetailRequested', star._id)
    },
    async hireSpecialist (specialist) {
        if (!await this.$confirm('Hire specialist', `Are you sure you want to hire a ${specialist.name} for ${this.getSpecialistActualCostString(specialist)} on Star ${this.star.name}?`)) {
          return
        }

        if (this.star.specialistId && !await this.$confirm('Replace specialist', `Are you sure you want to replace the existing specialist ${this.star.specialist.name} for a ${specialist.name}?`)) {
          return
        }

        this.isHiringSpecialist = true

        // If the specialist hired or existing specialist in any way affects scanning, manufacturing etc then reload the game map. Bit of a bodge but it works.
        let requiresFullReload = this.shouldSpecialistRequireReload(this.star.specialist) || this.shouldSpecialistRequireReload(specialist)

        try {
            let response = await SpecialistApiService.hireStarSpecialist(this.$store.state.game._id, this.starId, specialist.id)

            if (response.status === 200) {
              if (requiresFullReload) { // Its a bit shit but fuck it, easier than doing it server side.
                this.$emit('onReloadGameRequested', specialist)
              } else {
                let currency = this.$store.state.game.settings.specialGalaxy.specialistsCurrency

                this.star.specialistId = specialist.id
                this.star.specialistExpireTick = specialist.expireTicks ? this.$store.state.game.state.tick + specialist.expireTicks : null
                this.star.specialist = specialist
                this.star.effectiveTechs = response.data.effectiveTechs
                this.userPlayer[currency] -= specialist.cost[currency]

                this.userPlayer.stats.totalStarSpecialists++
                this.userPlayer.stats.totalSpecialists++

                this.eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star: this.star });
              }

              this.$toast.default(`${specialist.name} has been hired for the star ${this.star.name}.`)
            }
        } catch (err) {
            console.error(err)
        }

        this.isHiringSpecialist = false
    },
    getSpecialistActualCost (specialist) {
        return specialist.cost[this.$store.state.game.settings.specialGalaxy.specialistsCurrency]
    },
    getSpecialistActualCostString (specialist) {
      let actualCost = this.getSpecialistActualCost(specialist)

      switch (this.$store.state.game.settings.specialGalaxy.specialistsCurrency) {
        case 'credits':
          return `$${actualCost}`
        case 'creditsSpecialists':
          return `${actualCost} token${actualCost > 1 ? 's' : ''}`
      }
    },
    cantAffordSpecialist (specialist) {
        return this.userPlayer[this.$store.state.game.settings.specialGalaxy.specialistsCurrency] < this.getSpecialistActualCost(specialist)
    },
    shouldSpecialistRequireReload (specialist) {
      if (!specialist) {
        return false
      }

      const localKeys = [
        'scanning',
        'manufacturing'
      ]

      const specialKeys = [
        'economyInfrastructureMultiplier',
        'scienceInfrastructureMultiplier'
      ]

      if (specialist.modifiers && specialist.modifiers.local) {
        for (let key of localKeys) {
          if (specialist.modifiers.local[key] != null) {
            return true
          }
        }
      }

      if (specialist.modifiers && specialist.modifiers.special) {
        for (let key of specialKeys) {
          if (specialist.modifiers.special[key] != null) {
            return true
          }
        }
      }
    }
  },
  computed: {
    star () {
      return GameHelper.getStarById(this.$store.state.game, this.starId)
    },
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    isCurrentSpecialistOneShot () {
      return this.star.specialist && this.star.specialist.oneShot
    }
  }
}
</script>

<style scoped>
</style>
