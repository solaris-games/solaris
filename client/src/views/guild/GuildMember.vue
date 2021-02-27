<template>
  <tr>
    <td>
        <router-link :to="{ name: 'account-achievements', params: { userId: player._id }}">{{player.username}}</router-link>
    </td>
    <td :class="{
      'text-warning': playerIsLeader,
      'text-info': playerIsOfficer,
      'text-danger': playerIsInvitee
    }">{{role}}</td>
    <td align="right">{{player.achievements.rank}}</td>
    <td align="right">{{player.achievements.victories}}</td>
    <td align="right">{{player.achievements.renown}}</td>
    <td>
      <button class="btn btn-sm btn-danger ml-1" @click="disband()" v-if="isCurrentUser && playerIsLeader" title="Disband Guild">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm btn-danger ml-1" @click="leave()" v-if="isCurrentUser && !playerIsLeader" title="Leave Guild">
        <i class="fas fa-sign-out-alt"></i>
      </button>
      <button class="btn btn-sm btn-success ml-1" @click="promote()" v-if="canPromote" title="Promote Player">
        <i class="fas fa-level-up-alt"></i>
      </button>
      <button class="btn btn-sm btn-danger ml-1" @click="kick()" v-if="canKick" title="Kick Player">
        <i class="fas fa-level-down-alt"></i>
      </button>
      <button class="btn btn-sm btn-danger ml-1" @click="uninvite()" v-if="canRevokeInvite" title="Revoke Invitation">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  </tr>
</template>

<script>
import GuildApiService from '../../services/api/guild'

export default {
  props: {
    guild: Object,
    role: String,
    player: Object
  },
  methods: {
    async promote () {

    },
    async kick () {

    },
    async uninvite () {

    },
    async leave () {

    },
    async disband () {

    }
  },
  computed: {
    isCurrentUser () {
      return this.player._id === this.$store.state.userId
    },
    currentUserIsLeader () {
      return this.guild.leader._id === this.$store.state.userId
    },
    currentUserIsOfficer () {
      return this.guild.officers.find(x => x._id === this.$store.state.userId) != null
    },
    playerIsLeader () {
      return this.guild.leader._id === this.player._id
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
    canPromote () {
      if (this.playerIsOfficer) {
        return this.currentUserIsLeader
      } else if (this.playerIsMember) {
        return this.currentUserIsLeader || this.currentUserIsOfficer
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
    }
  }
}
</script>

<style scoped>

</style>
