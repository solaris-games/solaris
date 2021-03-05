<template>
<div class="menu-page container" v-if="carrierId">
  <menu-title :title="originalName" @onCloseRequested="onCloseRequested" />
  <div class="row bg-secondary pl-2 pt-2 pb-2">
    <strong>Name:</strong>
    <input class="ml-2 mr-2 auto-width" v-model="currentName" type="text" />
  </div>
  <div class="row pt-2 pb-2">
    <button class="btn btn-sm btn-success ml-1" @click="doRename">
      <i class="fas fa-save"></i>
      <span class="ml-1 d-none d-sm-inline-block">Save</span>
    </button>
  </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'

export default {
  components: {
    'menu-title': MenuTitle,
  },
  props: {
    carrierId: String,
    originalName: String
  },
  data () {
    return {
      currentName: this.originalName
    }
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    doRename (e) {

    }
  }
}
</script>