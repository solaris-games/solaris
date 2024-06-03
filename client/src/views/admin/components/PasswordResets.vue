<template>
  <administration-page>
    <loading-spinner :loading="!passwordResets"/>

    <div v-if="passwordResets">
      <h4 class="mb-1">Recent Password Resets</h4>
      <table class="mt-2 table table-sm table-striped table-responsive">
        <thead class="table-dark">
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user of passwordResets" :key="user._id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <a v-if="user.resetPasswordToken"
               :href="'#/account/reset-password-external?token=' + user.resetPasswordToken">Reset Link</a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </administration-page>
</template>

<script>
import LoadingSpinner from "../../components/LoadingSpinner.vue";
import AdminApiService from "../../../services/api/admin";
import AdministrationPage from "../AdministrationPage.vue";

export default {
  name: "PasswordResets",
  components: {
    'administration-page': AdministrationPage,
    'loading-spinner': LoadingSpinner
  },
  data() {
    return {
      passwordResets: null
    }
  },
  async mounted() {
    this.passwordResets = await this.getPasswordResets()
  },
  methods: {
    async getPasswordResets() {
      const resp = await AdminApiService.getPasswordResets()

      if (resp.status !== 200) {
        this.$toasted.error(resp.data.message)
        return null
      }

      return resp.data
    }
  }
}
</script>

<style scoped>

</style>
