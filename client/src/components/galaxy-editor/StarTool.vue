<template>
    <div id="star-attributes" v-if="galaxyEditor.selectedStar" >
      <div class='col-auto bg-dark'>
        <div class='row'>
          <label class='col-6 col-form-label-sm'>Economy</label>
          <input class='col mr-3 form-control-sm' type='number' v-model.number='galaxyEditor.selectedStar.infrastructure.economy'/>
        </div>
        <div class='row'>
          <label class='col-6 col-form-label-sm'>Industry</label>
          <input class='col mr-3 col form-control-sm' type='number' v-model.number='galaxyEditor.selectedStar.infrastructure.industry'/>
        </div>
        <div class='row'>
          <label class='col-6 col-form-label-sm'>Science</label>
          <input class='col mr-3 form-control-sm' type='number' v-model.number='galaxyEditor.selectedStar.infrastructure.science'/>
        </div>
        <div class='row form-check form-check-inline'>
          <div class='col-6'>
            <label>Warp Gate </label>
            <input class='form-check-input' type='checkbox' v-model.number='galaxyEditor.selectedStar.hasWarpGate'></input>
          </div>
          <div class='col-6'>
            <label>Home Star </label>
            <input class='form-check-input' type='checkbox' v-model.number='galaxyEditor.selectedStar.isHomeStar'></input>
          </div>
        </div>
        <div class='row'>
          <button @click="updateStar" class='col mx-3 btn btn-warning btn-lg'>Update</button>
          <button @click="destroyStar" class='col mx-3 btn btn-danger btn-lg'>Destroy</button>
        </div>
      </div>
    </div>
</template>

<script>
  export default {
    props: {
      galaxyEditor: Object
    },
    methods: {
      updateStar() {
        this.galaxyEditor.updateSelected()
      },
      destroyStar() {
        this.galaxyEditor.destroySelected()
      }
    }
  }
</script>

<style>
  #star-attributes {
    position: absolute;
  }
</style>
