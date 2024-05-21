<template>
  <div class="add-warning form-inline">
    <label for="warning-kind">Warning type</label>
    <select class="form-control input-sm" id="warning-kind" v-model="selectedWarningKind">
      <option value="afk">AFK</option>
      <option value="abusive">Abusive Behaviour</option>
      <option value="cheating">Cheating</option>
      <option value="other">Other</option>
    </select>
    <button class="btn btn-default" type="button">Add Warning</button>
  </div>
</template>

<script>
export default {
  name: "AddWarning",
  data () {
    return {
      selectedWarningKind: null
    }
  }
}
</script>

<style scoped>
.add-warning {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-grow: 1;
  align-items: center;
}
</style>
