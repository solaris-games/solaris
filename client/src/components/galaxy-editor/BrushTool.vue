<template>
  <div id="brush-tool" class='container'>
    <div class='row'>
      <div class='col'>
        <div class='row'>
        <label class='col'>Brush Radius</label>
        <input class='col form-control'type="number" v-model.number='toolOptions.brushRadius'/>
        </div>
      </div>
      <div class='col'>
        <div class='row'>
        <label class='col'>Star Amount</label>
        <input type="number" class='col form-control' v-model.number='toolOptions.starAmount'/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      toolOptions: Object
    },
    data () {
      return {
      }
    }
  }
</script>

<style>
</style>
