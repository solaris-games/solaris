<template>
  <div class="add-warning form-inline">
    <label for="warning-text">Warning text</label>
    <input class="form-control" type="text" id="warning-text" v-model="warningText" />
    <button class="btn btn-default btn-sm" type="button" @click="addWarning" :disabled="!this.warningText">Add Warning</button>
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
      warningText: null
    }
  },
  methods: {
    async addWarning(e) {
      e.preventDefault()

      if (!this.warningText) {
        return;
      }

      await AdminApiService.addWarning(this.userId, this.warningText);

      this.$emit("onUserChanged");
    }
  }
}
</script>

<style scoped>
.add-warning {
  margin-left: 12px;
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-grow: 1;
  align-items: center;
}

.add-warning * {
  flex-grow: 0;
}
</style>
