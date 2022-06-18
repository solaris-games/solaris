<template>
  <tr>
    <td>
      <router-link :to="{ name: 'guild-details', params: { guildId: application._id }}">
        <span>{{application.name}} [{{application.tag}}]</span>
      </router-link>
    </td>
    <td class="text-end">
      <button class="btn btn-sm btn-outline-success ms-1" v-if="!application.hasApplied" :disabled="isLoading" @click="apply()" title="Send application">
        <i class="fas fa-paper-plane"></i> Apply
      </button>
      <button class="btn btn-sm btn-danger ms-1" v-if="application.hasApplied" :disabled="isLoading" @click="withdraw()" title="Withdraw application">
        <i class="fas fa-trash"></i> Withdraw
      </button>
    </td>
  </tr>
</template>

<script>
import GuildApiService from '../../../services/api/guild'

export default {
  props: {
    application: Object
  },
  data () {
    return {
      isLoading: false
    }
  },
  methods: {
    async apply () {
      if (!await this.$confirm('Apply to Join', `Are you sure you want to apply to become a member of ${this.application.name}[${this.application.tag}]?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.apply(this.application._id)

        if (response.status === 200) {
          this.application.hasApplied = true
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async withdraw () {
      if (!await this.$confirm('Withdraw Application', `Are you sure you want to withdraw the application to ${this.application.name}[${this.application.tag}]?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.withdraw(this.application._id)

        if (response.status === 200) {
          this.application.hasApplied = false
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped>

</style>
