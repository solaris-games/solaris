<template>
  <view-container>
    <view-title :title="guild ? guildFullName : 'Guilds'" />

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && guild" class="mb-4">
      <p class="float-right">Total Rank: <span class="text-warning">{{guild.totalRank}}</span></p>

      <h5 class="mb-0">Guild Roster</h5>

      <p class="mb-2"><small class="text-warning">Total Members: {{1 + guild.officers.length + guild.members.length}}</small></p>

      <guild-member-list :guild="guild">
        <template v-slot:default="{ value, getColumnClass }">
          <guild-member :guild="guild" :player="value" :role="value.role" :getColumnClass="getColumnClass"
            @onPlayerPromoted="onPlayerPromoted"
            @onPlayerDemoted="onPlayerDemoted"
            @onPlayerKicked="onPlayerKicked"
            @onPlayerUninvited="onPlayerUninvited"></guild-member>
        </template>
      </guild-member-list>

      <guild-new-invite v-if="isLeader || isOfficer"
        :guildId="this.guild._id"
        @onUserInvited="onUserInvited"/>

      <router-link to="/guild/rename" class="btn btn-sm btn-primary mt-2" v-if="isLeader">
        <i class="fas fa-pencil-alt"></i> Rename Guild
      </router-link>
    </div>

    <div v-if="!isLoading && !guild" class="mb-4">
      <p>You are not a member of a guild. Accept an invitation to join a guild or found a new one.</p>

      <div class="text-center">
        <router-link to="/guild/create" class="btn btn-lg btn-success">
          <i class="fas fa-shield-alt"></i> Create a Guild
        </router-link>
      </div>

      <h4 class="mt-4">Guild Invites</h4>

      <p v-if="!invites.length" class="text-warning">You have no guild invitations.</p>

      <div class="table-responsive" v-if="invites.length">
          <table class="table table-striped table-hover">
              <tbody> 
                <guild-invite v-for="invite in invites" :key="invite.guildId"
                  :invite="invite"
                  @onInvitationAccepted="onInvitationAccepted"
                  @onInvitationDeclined="onInvitationDeclined"/>
              </tbody>
          </table>
      </div>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../../components/ViewContainer'
import ViewTitle from '../../components/ViewTitle'
import LoadingSpinner from '../../components/LoadingSpinner'
import GuildApiService from '../../services/api/guild'
import GuildNewInvite from './GuildNewInvite'
import GuildInvite from './GuildInvite'
import GuildMember from './GuildMember'
import GuildMemberList from './GuildMemberList'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'guild-new-invite': GuildNewInvite,
    'guild-invite': GuildInvite,
    'guild-member': GuildMember,
    'guild-member-list': GuildMemberList
  },
  data () {
    return {
      isLoading: false,
      guild: null,
      invites: []
    }
  },
  async mounted () {
    await this.loadGuild()
  },
  methods: {
    async loadGuild () {
      this.isLoading = true
      this.guild = null

      try {
        let response = await GuildApiService.detailMyGuild()

        if (response.status === 200) {
          this.guild = response.data
        }
        
        if (!this.guild) {
          response = await GuildApiService.listInvitations()

          if (response.status === 200) {
            this.invites = response.data
          }
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    onUserInvited (e) {
      this.guild.invitees.push(e)
    },
    onInvitationAccepted (e) {
      this.invites = []

      this.loadGuild()
    },
    // Fuck it.
    onInvitationDeclined (e) {
      this.loadGuild()
    },
    onPlayerPromoted (e) {
      this.loadGuild()
    },
    onPlayerDemoted (e) {
      this.loadGuild()
    },
    onPlayerKicked (e) {
      this.loadGuild()
    },
    onPlayerUninvited (e) {
      this.loadGuild()
    },
    isCurrentUser (userId) {
      return userId === this.$store.state.userId
    }
  },
  computed: {
    guildFullName () {
      return `${this.guild.name} [${this.guild.tag}]`
    },
    isLeader () {
      return this.guild.leader != null && this.guild.leader._id === this.$store.state.userId
    },
    isOfficer () {
      return this.guild.officers.find(x => x._id === this.$store.state.userId) != null
    }
  }
}
</script>

<style scoped>
</style>
