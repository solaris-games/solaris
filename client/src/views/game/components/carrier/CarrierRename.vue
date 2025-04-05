<template>
<div class="menu-page container" v-if="carrierId">
  <menu-title title="Rename Carrier" @onCloseRequested="onCloseRequested" :disabled="isSaving">
    <button @click="viewOnMap" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
  </menu-title>

  <form @submit="doRename">
    <div class="mb-2">
      <input type="text" class="form-control" id="name" placeholder="Enter a new carrier name" v-model="currentName" minlength="3" maxlength="30">
    </div>
    <div class="mb-2 row pb-2 pt-2 ">
      <div class="col">
        <button type="button" class="btn btn-sm btn-primary" :disabled="isSaving" @click="onOpenCarrierDetailRequested">
          <i class="fas fa-arrow-left"></i>
          Back to Carrier
        </button>
      </div>
      <div class="col-auto">
        <button type="submit" class="btn btn-sm btn-success" :disabled="$isHistoricalMode() || isSaving || isNameInvalid">
          <i class="fas fa-save"></i>
          Rename
        </button>
      </div>
    </div>
  </form>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import CarrierApiService from '../../../../services/api/carrier'
import gameHelper from '../../../../services/gameHelper'
import GameContainer from '../../../../game/container'
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "@/eventBus";
import { inject } from 'vue';

export default {
  components: {
    'menu-title': MenuTitle
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
      carrier: null,
      isSaving: false,
      currentName: ''
    }
  },
  mounted () {
    this.carrier = gameHelper.getCarrierById(this.$store.state.game, this.carrierId)
    this.currentName = this.carrier.name
  },
  computed: {
    isNameInvalid () {
      const trimmed = this.currentName.trim()

      return trimmed.length < 3 || trimmed.length > 30
    }
  },
  methods: {
    onCloseRequested (e) {
      GameContainer.unselectAllCarriers()

      this.$emit('onCloseRequested', e)
    },
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', this.carrierId)
    },
    viewOnMap (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: this.carrier });
    },
    async doRename (e) {
      e.preventDefault()

      this.isSaving = true

      try {
        await CarrierApiService.renameCarrier(this.$store.state.game._id, this.carrierId, this.currentName)

        gameHelper.getCarrierById(this.$store.state.game, this.carrierId).name = this.currentName

        this.$toast.default(`Carrier renamed to ${this.currentName}.`)

        this.onCloseRequested(e)
      } catch (err) {
        this.$toast.error('Failed to rename carrier.')
        console.error(err)
      }

      this.isSaving = false
    }
  }
}
</script>
