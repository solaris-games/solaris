<template>
    <div class="menu-page container">
        <menu-title title="Combat Calculator" @onCloseRequested="onCloseRequested"/>

        <div class="row">
            <div class="col-12">
                <form-error-list v-bind:errors="errors"/>
            </div>
            <form class="col-12" @submit="calculate">
                <div class="mb-2 row">
                    <label for="defenderWeaponTech" class="col-8 col-form-label">
                      <i class="fas" :class="{'fa-gun':!defender.player,'fa-user':defender.player}"></i>
                      <span class="text-success ms-2">{{defender.player ? defender.player.alias : 'Defender'}}</span> Weapons
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderWeaponTech" placeholder="Tech Level" v-model="defender.weaponsLevel" required="required">
                    </div>
                </div>
                <div class="mb-2 row">
                    <label for="defenderShips" class="col-8 col-form-label">
                      <i class="fas" :class="{'fa-rocket':!defender.star,'fa-star':defender.star}"></i>
                      <span class="text-success ms-2">{{defender.star ? defender.star.name : 'Defender'}}</span> Ships
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderShips" placeholder="Ships" v-model="defender.ships" required="required">
                    </div>
                </div>
                <div class="mb-2 row">
                  <div class="col-8">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="isTurnBased" id="chkIsTurnBased">
                      <label class="form-check-label" for="chkIsTurnBased">
                        Carrier-to-Star Combat
                      </label>
                    </div>
                  </div>
                </div>
                <div class="mb-2 row" v-if="hasDefenderBonus">
                  <div class="col-8">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="includeDefenderBonus" id="chkDefenderBonus">
                      <label class="form-check-label" for="chkDefenderBonus">
                        Defender Bonus
                      </label>
                    </div>
                  </div>

                  <label class="col-4 col-form-label text-end text-success pt-0 pb-0" v-if="includeDefenderBonus">+1 Weapons</label>
                </div>

                <hr/>

                <div class="mb-2 row">
                    <label for="attackerWeaponTech" class="col-8 col-form-label">
                      <i class="fas" :class="{'fa-gun':!attacker.player,'fa-user':attacker.player}"></i>
                      <span class="text-danger ms-2">{{attacker.player ? attacker.player.alias : 'Attacker'}}</span> Weapons
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerWeaponTech" placeholder="Tech Level" v-model="attacker.weaponsLevel" required="required">
                    </div>
                </div>
                <div class="mb-2 row">
                    <label for="attackerShips" class="col-8 col-form-label">
                      <i class="fas fa-rocket"></i>
                      <span class="text-danger ms-2">{{attacker.carrier ? attacker.carrier.name : 'Attacker'}}</span> Ships
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerShips" placeholder="Ships" v-model="attacker.ships" required="required">
                    </div>
                </div>

                <div class="mb-2 row">
                  <div class="col-auto col-sm-8">
                    <button type="button" class="btn btn-outline-info" :disabled="isLoading" title="Swap the defender/attacker values" @click="swapValues"><i class="fas fa-exchange-alt"></i> Swap Values</button>
                  </div>
                  <div class="col col-sm-4">
                    <div class="d-grid gap-2">
                      <button type="submit" class="btn btn-success" :disabled="isLoading" title="Calculate the combat result"><i class="fas fa-fist-raised"></i> Fight</button>
                    </div>
                  </div>
                </div>
            </form>
        </div>

        <loading-spinner :loading="isLoading"/>

        <div class="row bg-dark pt-2 pb-2" v-if="result">
          <p class="col text-center mb-0" v-if="result.after.defender >= result.after.attacker"><span class="text-success">Defender</span> wins with <span class="text-success">{{result.after.defender}}</span> ship(s) remaining.</p>
          <p class="col text-center mb-0" v-if="result.after.attacker > result.after.defender"><span class="text-danger">Attacker</span> wins with <span class="text-danger">{{result.after.attacker}}</span> ship(s) remaining.</p>
        </div>
        <div class="row bg-dark pb-2" v-if="result">
          <p class="col text-center mb-0" v-if="result.needed.defender"><small><span class="text-success">Defender</span> would need <span class="text-success">{{result.needed.defender}}</span> ship(s) to win.</small></p>
          <p class="col text-center mb-0" v-if="result.needed.attacker"><small><span class="text-danger">Attacker</span> would need <span class="text-danger">{{result.needed.attacker}}</span> ship(s) to win.</small></p>
        </div>
    </div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner.vue'
import MenuTitle from '../MenuTitle.vue'
import FormErrorList from '../../../components/FormErrorList.vue'
import GameHelper from '../../../../services/gameHelper'
import CarrierApiService from '../../../../services/api/carrier'
import { inject } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'form-error-list': FormErrorList
  },
  props: {
    carrierId: String
  },

  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      isLoading: false,
      errors: [],
      hasDefenderBonus: false,
      includeDefenderBonus: true,
      isTurnBased: true,
      defender: {
        ships: 0,
        weaponsLevel: 1,
        player: null,
        star: null
      },
      attacker: {
        ships: 0,
        weaponsLevel: 1,
        player: null,
        carrier: null
      },
      result: null
    }
  },
  async mounted () {
    this.hasDefenderBonus = this.$store.state.game.settings.specialGalaxy.defenderBonus === 'enabled'
    this.includeDefenderBonus = this.hasDefenderBonus

    if (this.carrierId) {
      await this.tryAutoCalculate()
    }
  },
  methods: {
    onCloseRequested (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllStars);
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllCarriers);

      this.$emit('onCloseRequested', e)
    },
    swapValues () {
      let dS = this.defender.ships,
          dW = this.defender.weaponsLevel,
          aS = this.attacker.ships,
          aW = this.attacker.weaponsLevel

      this.defender.ships = aS
      this.defender.weaponsLevel = aW
      this.attacker.ships = dS
      this.attacker.weaponsLevel = dW
    },
    async tryAutoCalculate () {
      let game = this.$store.state.game

      if (this.carrierId) {
        // Work out where the carrier is travelling to and add the ships and weapons level
        // of the destination star.
        this.attacker.carrier = GameHelper.getCarrierById(game, this.carrierId)
        this.attacker.player = GameHelper.getCarrierOwningPlayer(game, this.attacker.carrier)

        if (this.attacker.carrier.waypoints && this.attacker.carrier.waypoints.length) {
          this.defender.star = GameHelper.getStarById(game, this.attacker.carrier.waypoints[0].destination)

          this.attacker.ships = this.attacker.carrier.ships
          this.attacker.weaponsLevel = this.attacker.player.research.weapons.level

          if (this.defender.star) { // May be out of scanning range.
            this.defender.player = GameHelper.getStarOwningPlayer(game, this.defender.star)
            let defenderShips = GameHelper.getStarTotalKnownShips(game, this.defender.star)

            this.defender.ships = defenderShips

            if (this.defender.player) {
              this.defender.weaponsLevel = this.defender.player.research.weapons.level
            }
          }
        }
      }
    },
    async calculate (e) {
      this.errors = []

      if (this.defender.weaponsLevel <= 0) {
        this.errors.push('Defender weapons level must be greater than 0.')
      }

      if (this.defender.ships < 0) {
        this.errors.push('Defender ships must be greater than or equal to 0.')
      }

      if (this.attacker.weaponsLevel <= 0) {
        this.errors.push('Attacker weapons level must be greater than 0.')
      }

      if (this.attacker.ships < 0) {
        this.errors.push('Attacker ships must be greater than or equal to 0.')
      }

      if (e) {
        e.preventDefault()
      }

      if (this.errors.length) return

      this.isLoading = true
      this.result = null

      try {
        let response = await CarrierApiService.calculateCombat(this.$store.state.game._id, {
          weaponsLevel: +this.defender.weaponsLevel + (this.includeDefenderBonus ? 1 : 0),
          ships: +this.defender.ships
        }, {
          weaponsLevel: +this.attacker.weaponsLevel,
          ships: +this.attacker.ships
        }, this.isTurnBased)

        if (response.status === 200) {
          this.result = response.data
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.form-check-input, .form-check-label {
  cursor: pointer;
}
</style>
