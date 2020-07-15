<template>
  <div class="container">
    <menu-title title="Bulk Upgrade" @onCloseRequested="onCloseRequested" />

    <div class="row">
      <div class="col-7">
        <p>Select an amount of money to spend and the kind of infrastructure you would like to buy. The cheapest infrastructure will be purchased throughout your empire.</p>
      </div>
      <div class="col-5">
        <form @submit.prevent>
          <div class="form-group">
            <input
              class="form-control"
              id="amount"
              v-model="amount"
              type="number"
              required="required"
            />
          </div>
          <div class="form-group">
            <select class="form-control" id="infrastructureType" v-model="selectedType">
              <option
                v-for="opt in types"
                v-bind:key="opt.key"
                v-bind:value="opt.key"
              >{{ opt.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <button class="btn btn-success btn-block" @click="upgrade" :disabled="isUpgrading">Upgrade</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import MenuTitle from "../MenuTitle"
import starService from "../../../services/api/star"
import GameHelper from "../../../services/gameHelper"

export default {
  components: {
    "menu-title": MenuTitle
  },
  data() {
    return {
      isUpgrading: false,
      amount: 0,
      selectedType: "economy",
      types: [
        {
          key: "economy",
          name: "Economy"
        },
        {
          key: "industry",
          name: "Industry"
        },
        {
          key: "science",
          name: "Science"
        }
      ]
    }
  },
  mounted() {
    this.amount = GameHelper.getUserPlayer(this.$store.state.game).credits
  },
  methods: {
    onCloseRequested(e) {
      this.$emit("onCloseRequested", e)
    },
    async upgrade () {
      if (this.amount <= 0) {
        return
      }

      try {
        this.isUpgrading = true

        let response = await starService.bulkInfrastructureUpgrade(
          this.$store.state.game._id,
          this.selectedType,
          this.amount
        )

        if (response.status === 200) {
          this.$emit("onBulkInfrastructureUpgraded", {
            type: this.selectedType,
            amount: this.amount
          })

          this.$toasted.show(`Upgrade complete. Purchased ${response.data.upgraded} ${this.selectedType} for ${response.data.cost} credits.`, { type: 'success' })
        
          // TODO: Update the player credits amount and update all stars.
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgrading = false
    }
  }
}
</script>

<style scoped>
</style>
