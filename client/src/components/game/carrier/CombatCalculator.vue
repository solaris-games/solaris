<template>
    <div class="container">
        <menu-title title="Combat Calculator" @onCloseRequested="onCloseRequested"/>

        <div class="row">
            <div class="col-12">
                <form-error-list v-bind:errors="errors"/>
            </div>
            <form class="col-12" @submit="calculate">
                <div class="form-group row">
                    <label for="defenderWeaponTech" class="col-8 col-form-label">Defender Weapon Technology</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderWeaponTech" placeholder="Tech Level" v-model="defender.weaponsLevel" required="required">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="defenderShips" class="col-8 col-form-label">Defender Ships</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderShips" placeholder="Ships" v-model="defender.ships" required="required">
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-8 col-form-label">Defender Bonus</label>
                    <label class="col-4 col-form-label text-right text-success">+1 Weapons</label>
                </div>

                <hr/>

                <div class="form-group row">
                    <label for="attackerWeaponTech" class="col-8 col-form-label">Attacker Weapon Technology</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerWeaponTech" placeholder="Tech Level" v-model="attacker.weaponsLevel" required="required">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="attackerShips" class="col-8 col-form-label">Attacker Ships</label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerShips" placeholder="Ships" v-model="attacker.ships" required="required">
                    </div>
                </div>

                <div class="form-group row">
                    <div class="col-8"></div>
                    <div class="col-4">
                        <button type="submit" class="btn btn-success btn-block" :disabled="isLoading">Fight</button>
                    </div>
                </div>
            </form>
        </div>

        <loading-spinner :loading="isLoading"/>
        
        <div class="row" v-if="result">
            <p class="col text-right" v-if="result.defenderShips >= result.attackerShips"><span class="text-success">Defender</span> wins with <span class="text-success">{{result.defenderShips}}</span> ships remaining.</p>
            <p class="col text-right" v-if="result.attackerShips > result.defenderShips"><span class="text-danger">Attacker</span> wins with <span class="text-danger">{{result.attackerShips}}</span> ships remaining.</p>
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
        errors: [],
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
            })

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

</style>
