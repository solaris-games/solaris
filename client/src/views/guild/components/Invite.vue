<template>
  <tr>
    <td>
      <router-link :to="{ name: 'guild-details', params: { guildId: invite._id }}">
        <span>{{invite.name}} [{{invite.tag}}]</span>
      </router-link>
    </td>
    <td class="text-end">
      <button class="btn btn-sm btn-success ms-1" :disabled="isLoading" @click="accept()" title="Accept invitation">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn btn-sm btn-danger ms-1" :disabled="isLoading" @click="reject()" title="Reject invitation">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  </tr>
</template>

<script>
import GuildApiService from '../../../services/api/guild'

export default {
  props: {
    invite: Object
  },
  data () {
    return {
      isLoading: false
    }
  },
  methods: {
    async accept () {
      if (!await this.$confirm('Accept invitation', `Are you sure you want to accept the invitation from ${this.invite.name}[${this.invite.tag}]?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.accept(this.invite._id)

        if (response.status === 200) {
          this.$emit('onInvitationAccepted', this.invite._id)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async reject () {
      if (!await this.$confirm('Decline invitation', `Are you sure you want to decline the invitation from ${this.invite.name}[${this.invite.tag}]?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.decline(this.invite._id)

        if (response.status === 200) {
          this.$emit('onInvitationDeclined', this.invite._id)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    }
  },
  computed: {

  }
}
</script>

<style scoped>

</style>
