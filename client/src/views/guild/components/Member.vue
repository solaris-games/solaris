<template>
  <tr>
    <td>
        <router-link :to="{ name: 'account-achievements', params: { userId: player._id }}">{{player.username}}</router-link>
    </td>
    <td :class="{
      'text-warning': playerIsLeader,
      'text-info': playerIsOfficer,
      'text-danger': playerIsInvitee,
      'text-success': playerIsApplicant,
      ...getColumnClass('role')
    }">{{roleName}}</td>
    <td align="right" :class="getColumnClass('rank')">
      {{player.achievements.rank}}
      <img class="user-level-icon" :src="levelSrc">
    </td>
    <td align="right" :class="getColumnClass('victories')">{{player.achievements.victories}}</td>
    <td align="right" :class="getColumnClass('renown')">{{player.achievements.renown}}</td>
    <td class="text-end">
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="disband()" v-if="isCurrentUser && playerIsLeader" title="Disband the guild">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="leave()" v-if="isCurrentUser && !playerIsLeader" title="Leave the guild">
        <i class="fas fa-sign-out-alt"></i>
      </button>
      <button class="btn btn-sm btn-outline-success ms-1" :disabled="isLoading" @click="promote()" v-if="canPromote" title="Promote this player">
        <i class="fas fa-level-up-alt"></i>
      </button>
      <button class="btn btn-sm btn-outline-warning ms-1" :disabled="isLoading" @click="demote()" v-if="canDemote" title="Demote this player">
        <i class="fas fa-level-down-alt"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="kick()" v-if="canKick" title="Kick this player from the guild">
        <i class="fas fa-ban"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="uninvite()" v-if="canRevokeInvite" title="Revoke invitation">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm btn-outline-success ms-1" :disabled="isLoading" @click="accept()" v-if="canRevokeApplication" title="Accept application">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger ms-1" :disabled="isLoading" @click="reject()" v-if="canRevokeApplication" title="Reject application">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  </tr>
</template>

<script>
import router from '../../../router'
import GuildApiService from '../../../services/api/guild'

export default {
  props: {
    guild: Object,
    role: String,
    player: Object,
    getColumnClass: Function
  },
  data () {
    return {
      isLoading: false
    }
  },
  methods: {
    async promote () {
      if (!await this.$confirm('Promote player', `Are you sure you want to promote ${this.player.username}?`)) {
        return
      }

      if (this.playerIsOfficer && !await this.$confirm('Promote to Guild Leader', `${this.player.username} will be promoted to the Guild Leader and you will be demoted to Officer, are you sure?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.promote(this.guild._id, this.player._id)

        if (response.status === 200) {
          this.$emit('onPlayerPromoted', this.player._id)

          this.$toast.default(`${this.player.username} promoted.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async demote () {
      if (!await this.$confirm('Demote player', `Are you sure you want to demote ${this.player.username}?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.demote(this.guild._id, this.player._id)

        if (response.status === 200) {
          this.$emit('onPlayerDemoted', this.player._id)

          this.$toast.default(`${this.player.username} demoted.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async kick () {
      if (!await this.$confirm('Kick player', `Are you sure you want to kick ${this.player.username}?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.kick(this.guild._id, this.player._id)

        if (response.status === 200) {
          this.$emit('onPlayerKicked', this.player._id)

          this.$toast.default(`${this.player.username} kicked.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async uninvite () {
      if (!await this.$confirm('Uninvite player', `Are you sure you want to uninvite ${this.player.username}?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.uninvite(this.guild._id, this.player._id)

        if (response.status === 200) {
          this.$emit('onPlayerUninvited', this.player._id)

          this.$toast.default(`${this.player.username} uninvited.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async accept () {
      if (!await this.$confirm('Accept Application', `Are you sure you want to accept the application from ${this.player.username}?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.accept(this.guild._id, this.player._id)

        if (response.status === 200) {
          this.$emit('onPlayerApplicationAccepted', this.player._id)

          this.$toast.default(`${this.player.username} application accepted.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async reject () {
      if (!await this.$confirm('Reject Application', `Are you sure you want to reject the application from ${this.player.username}?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.reject(this.guild._id, this.player._id)

        if (response.status === 200) {
          this.$emit('onPlayerApplicationRejected', this.player._id)

          this.$toast.default(`${this.player.username} application rejected.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async leave () {
      if (!await this.$confirm('Leave guild', `Are you sure you want to leave the guild?`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.leave(this.guild._id)

        if (response.status === 200) {
          this.$toast.default(`You have left ${this.guild.name}[${this.guild.tag}].`)

          router.push({ name: 'main-menu' })
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    async disband () {
      if (!await this.$confirm('Disband guild', `Are you sure you want to disband the guild?`)) {
        return
      }

      if (!await this.$confirm('Disband guild', `Are you absolutely sure you want to disband the guild? The guild will be deleted and all members kicked, this cannot be undone.`)) {
        return
      }

      this.isLoading = true

      try {
        let response = await GuildApiService.delete(this.guild._id)

        if (response.status === 200) {
          this.$toast.default(`You have disbanded ${this.guild.name}[${this.guild.tag}].`)

          router.push({ name: 'main-menu' })
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    }
  },
  computed: {
    levelSrc () {
      return new URL(`../../../assets/levels/${this.player.achievements.level}.png`, import.meta.url).href;
    },
    roleName () {
      return this.role.charAt(0).toUpperCase() + this.role.slice(1);
    },
    isCurrentUser () {
      return this.player._id === this.$store.state.userId
    },
    currentUserIsLeader () {
      return this.guild.leader != null && this.guild.leader._id === this.$store.state.userId
    },
    currentUserIsOfficer () {
      return this.guild.officers.find(x => x._id === this.$store.state.userId) != null
    },
    playerIsLeader () {
      return this.guild.leader != null && this.guild.leader._id === this.player._id
    },
    playerIsOfficer () {
      return this.guild.officers.find(x => x._id === this.player._id) != null
    },
    playerIsMember () {
      return this.guild.members.find(x => x._id === this.player._id) != null
    },
    playerIsInvitee () {
      return this.guild.invitees.find(x => x._id === this.player._id) != null
    },
    playerIsApplicant () {
      return this.guild.applicants.find(x => x._id === this.player._id) != null
    },
    canPromote () {
      if (this.playerIsOfficer) {
        return this.currentUserIsLeader
      } else if (this.playerIsMember) {
        return this.currentUserIsLeader || this.currentUserIsOfficer
      } else {
        return false
      }
    },
    canDemote () {
      if (this.playerIsOfficer) {
        return this.currentUserIsLeader
      } else {
        return false
      }
    },
    canKick () {
      if (this.playerIsOfficer) {
        return this.currentUserIsLeader
      } else if (this.playerIsMember) {
        return this.currentUserIsLeader || this.currentUserIsOfficer
      } else {
        return false
      }
    },
    canRevokeInvite () {
      if (this.playerIsInvitee) {
        return this.currentUserIsLeader || this.currentUserIsOfficer
      } else {
        return false
      }
    },
    canRevokeApplication () {
      if (this.playerIsApplicant) {
        return this.currentUserIsLeader || this.currentUserIsOfficer
      } else {
        return false
      }
    }
  }
}
</script>

<style scoped>
.user-level-icon {
  height: 28px;
}
</style>
