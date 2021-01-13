<template>
    <div class="menu-page container">
        <menu-title title="Combat Calculator" @onCloseRequested="onCloseRequested"/>

        <div class="row">
            <div class="col-12">
                <form-error-list v-bind:errors="errors"/>
            </div>
            <form class="col-12" @submit="calculate">
                <div class="form-group row">
                    <label for="defenderWeaponTech" class="col-8 col-form-label"><i class="fas fa-fighter-jet"></i> <span class="text-success ml-2">Defender</span> Weapons</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderWeaponTech" placeholder="Tech Level" v-model="defender.weaponsLevel" required="required">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="defenderShips" class="col-8 col-form-label"><i class="fas fa-rocket"></i> <span class="text-success ml-2">Defender</span> Ships</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderShips" placeholder="Ships" v-model="defender.ships" required="required">
                    </div>
                </div>
                <div class="form-group row" v-if="hasDefenderBonus">
                  <div class="col-8">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="includeDefenderBonus" id="chkDefenderBonus">
                      <label class="form-check-label" for="chkDefenderBonus">
                        Defender Bonus
                      </label>
                    </div>
                  </div>

                  <label class="col-4 col-form-label text-right text-success pt-0 pb-0" v-if="includeDefenderBonus">+1 Weapons</label>
                </div>

                <hr/>

                <div class="form-group row">
                    <label for="attackerWeaponTech" class="col-8 col-form-label"><i class="fas fa-fighter-jet"></i> <span class="text-danger ml-2">Attacker</span> Weapons</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerWeaponTech" placeholder="Tech Level" v-model="attacker.weaponsLevel" required="required">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="attackerShips" class="col-8 col-form-label"><i class="fas fa-rocket"></i> <span class="text-danger ml-2">Attacker</span> Ships</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerShips" placeholder="Ships" v-model="attacker.ships" required="required">
                    </div>
                </div>

                <div class="form-group row">
                    <div class="col-8"></div>
                    <div class="col-4">
                        <button type="submit" class="btn btn-success btn-block" :disabled="isLoading"><i class="fas fa-fist-raised"></i> Fight</button>
                    </div>
                </div>
            </form>
        </div>

        <loading-spinner :loading="isLoading"/>

        <div class="row" v-if="result">
            <p class="col text-right" v-if="result.after.defender >= result.after.attacker"><span class="text-success">Defender</span> wins with <span class="text-success">{{result.after.defender}}</span> ship(s) remaining.</p>
            <p class="col text-right" v-if="result.after.attacker > result.after.defender"><span class="text-danger">Attacker</span> wins with <span class="text-danger">{{result.after.attacker}}</span> ship(s) remaining.</p>
        </div>
    </div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MenuTitle from '../MenuTitle'
import FormErrorList from '../../..//components/FormErrorList'
import GameHelper from '../../../services/gameHelper'
import CarrierApiService from '../../../services/api/carrier'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'form-error-list': FormErrorList
  },
  props: {

  },
  data () {
    return {
      isLoading: false,
      errors: [],
      hasDefenderBonus: false,
      includeDefenderBonus: true,
      defender: {
        ships: 0,
        weaponsLevel: 1
      },
      attacker: {
        ships: 0,
        weaponsLevel: 1
      },
      result: null
    }
  },
  mounted () {
    this.hasDefenderBonus = this.$store.state.game.settings.specialGalaxy.defenderBonus === 'enabled'
    this.includeDefenderBonus = this.hasDefenderBonus
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    async calculate (e) {
      this.errors = []

      if (this.defender.weaponsLevel <= 0) {
        this.errors.push('Defender weapons level must be greater than 0.')
      }

      if (this.defender.ships <= 0) {
        this.errors.push('Defender ships must be greater than 0.')
      }

      if (this.attacker.weaponsLevel <= 0) {
        this.errors.push('Attacker weapons level must be greater than 0.')
      }

      if (this.attacker.ships <= 0) {
        this.errors.push('Attacker ships must be greater than 0.')
      }

      e.preventDefault()

      if (this.errors.length) return

      this.isLoading = true
      this.result = null

      try {
        let response = await CarrierApiService.calculateCombat(this.$store.state.game._id, {
          weaponsLevel: +this.defender.weaponsLevel,
          ships: +this.defender.ships
        }, {
          weaponsLevel: +this.attacker.weaponsLevel,
          ships: +this.attacker.ships
        },
        this.includeDefenderBonus)

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
