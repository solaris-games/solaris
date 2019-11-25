<template>
 <form @submit.prevent>
    <div class="form-group row mb-2 bg-primary">
        <label class="col col-form-label">Total Science:</label>
        <div class="col text-right">
            <label class="col-form-label">0</label>
        </div>
    </div>
    <div class="form-group row mb-2">
        <label class="col col-form-label">Researching Now:</label>
        <div class="col">
            <select class="form-control">
                <option>Scanning</option>
                <option>Hyperspace Range</option>
                <option>Terraforming</option>
                <option>Experimentation</option>
                <option>Weapons</option>
                <option>Banking</option>
                <option>Manufacturing</option>
            </select>
        </div>
    </div>
    <div class="form-group row mb-2 bg-primary">
        <label class="col col-form-label">Current Research ETA:</label>
        <div class="col text-right">
            <label class="col-form-label">0d 0h 0m 0s</label>
        </div>
    </div>
    <div class="form-group row mb-2">
        <label class="col col-form-label">Research Next:</label>
        <div class="col">
            <select class="form-control">
                <option>Scanning</option>
                <option>Hyperspace Range</option>
                <option>Terraforming</option>
                <option>Experimentation</option>
                <option>Weapons</option>
                <option>Banking</option>
                <option>Manufacturing</option>
            </select>
        </div>
    </div>
</form>
</template>

<script>
export default {
  props: {
    game: Object
  }
}
</script>

<style scoped>
</style>
