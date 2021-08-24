<template>
  <div id="JSON-tools">
    <div class='row'>
        <button @click="loadFromJSON" class='col mx-3 btn btn-success btn-lg mb-3 '>Load from JSON <i class="fa fa-chevron-up"/></button>
        <button @click="generateJSON" class='col mx-3 btn btn-success btn-lg mb-3 '><i class="fa fa-chevron-down"></i> Generate JSON</button>
    </div>
    <div>
      <textarea class='col-12' v-model="customJSON"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    galaxyEditor: Object
  },
  data () {
    return {
      customJSON: ""
    }
  },
  methods: {
    generateJSON() {
      this.customJSON = this.galaxyEditor.generateJSON()
    },
    loadFromJSON() {
      this.galaxyEditor.loadFromJSON(this.customJSON)
    }
  }
 
}
</script>

<style>
</style>
