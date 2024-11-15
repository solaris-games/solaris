<template>
  <div class="add-warning form-inline">
    <label for="warning-text">Warning text</label>
    <input class="form-control" type="text" id="warning-text" v-model="warningText" />
    <button class="btn btn-success btn-sm" type="button" @click="addWarning" :disabled="!this.warningText">Add Warning</button>
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

      this.warningText = null;
    }
  }
}
</script>

<style scoped>
  .add-warning {
    display: flex;
    width: 100%;
    gap: 8px;
    align-items: center;
    margin-left: 12px;
  }

  @media screen and (max-width: 576px) {
    .add-warning {
      flex-direction: column;
    }
  }

  .add-warning > .form-control {
      flex: 1;
  }
</style>
