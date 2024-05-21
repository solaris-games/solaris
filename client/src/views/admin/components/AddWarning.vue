<template>
  <div class="add-warning form-inline">
    <label for="warning-kind">Warning type</label>
    <select class="form-control input-sm" id="warning-kind" v-model="selectedWarningKind">
      <option value="afk">AFK</option>
      <option value="abusive">Abusive Behaviour</option>
      <option value="cheating">Cheating</option>
      <option value="other">Other</option>
    </select>
    <button class="btn btn-default btn-sm" type="button" @click="addWarning" :disabled="!this.selectedWarningKind">Add Warning</button>
  </div>
</template>

<script>
import AdminApiService from "../../../services/api/admin";

export default {
  name: "AddWarning",
  props: {
    userId: String,
  },
  data () {
    return {
      selectedWarningKind: null
    }
  },
  methods: {
    async addWarning(e) {
      e.preventDefault()

      if (!this.selectedWarningKind) {
        return;
      }

      await AdminApiService.addWarning(this.userId, this.selectedWarningKind);

      this.$emit("onUserChanged");
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

.add-warning * {
  flex-grow: 0;
}
</style>
