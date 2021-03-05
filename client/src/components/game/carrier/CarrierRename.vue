<template>
<div class="menu-page container" v-if="carrierId">
  <menu-title :title="originalName" @onCloseRequested="onCloseRequested" :disabled="isSaving" />
  <div class="row bg-secondary pl-2 pt-2 pb-2">
    <strong>Name:</strong>
    <input class="ml-2 mr-2 auto-width" v-model="currentName" type="text" maxlength="30" />
  </div>
  <div class="row pt-2 pb-2">
    <button class="btn btn-sm btn-success ml-1" @click="doRename" :disabled="isSaving || isNameInvalid">
      <i class="fas fa-save"></i>
      <span class="ml-1 d-none d-sm-inline-block">Save</span>
    </button>
  </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import CarrierApiService from '../../../services/api/carrier'

export default {
  components: {
    'menu-title': MenuTitle
  },
  props: {
    carrierId: String,
    originalName: String
  },
  data () {
    return {
      isSaving: false,
      currentName: this.originalName
    }
  },
  computed: {
    isNameInvalid () {
      const trimmed = this.currentName.trim();
      return trimmed.length < 4 || trimmed.length > 30;
    }
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    async doRename (e) {
      this.isSaving = true
      try {
        await CarrierApiService.renameCarrier(this.$store.state.game._id, this.carrierId, this.currentName)
        this.$toasted.show(`Carrier renamed to ${this.currentName}.`)
        this.onCloseRequested(e)
      } catch (err) {
        console.error(err)
      }
      this.isSaving = false
    }
  }
}
</script>
