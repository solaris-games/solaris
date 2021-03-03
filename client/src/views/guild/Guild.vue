<template>
  <view-container>
    <view-title :title="guild ? guildFullName : 'Guilds'" />

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && guild">
      <p class="float-right">Total Rank: <span class="text-warning">{{guild.totalRank}}</span></p>

      <h5>Guild Roster</h5>

      <div class="table-responsive">
          <table class="table table-striped table-hover">
              <thead>
                  <th>Player</th>
                  <th>Role</th>
                  <th class="text-right" title="Rank"><i class="fas fa-star text-info"></i></th>
                  <th class="text-right" title="Victories"><i class="fas fa-trophy text-warning"></i></th>
                  <th class="text-right" title="Renown"><i class="fas fa-heart text-danger"></i></th>
                  <th></th>
              </thead>
              <tbody> 
                <guild-member :guild="guild" :player="guild.leader" role="Leader"
                  @onPlayerPromoted="onPlayerPromoted"
                  @onPlayerKicked="onPlayerKicked"
                  @onPlayerUninvited="onPlayerUninvited"/>

                <guild-member :guild="guild" :player="officer" role="Officer"
                  v-for="officer in guild.officers" :key="officer._id"
                  @onPlayerPromoted="onPlayerPromoted"
                  @onPlayerDemoted="onPlayerDemoted"
                  @onPlayerKicked="onPlayerKicked"
                  @onPlayerUninvited="onPlayerUninvited"/>

                <guild-member :guild="guild" :player="member" role="Member"
                  v-for="member in guild.members" :key="member._id"
                  @onPlayerPromoted="onPlayerPromoted"
                  @onPlayerKicked="onPlayerKicked"
                  @onPlayerUninvited="onPlayerUninvited"/>

                <guild-member :guild="guild" :player="invitee" role="Invitee"
                  v-for="invitee in guild.invitees" :key="invitee._id"
                  @onPlayerPromoted="onPlayerPromoted"
                  @onPlayerKicked="onPlayerKicked"
                  @onPlayerUninvited="onPlayerUninvited"/>
              </tbody>
          </table>
      </div>

      <guild-new-invite v-if="isLeader || isOfficer"
        :guildId="this.guild._id"
        @onUserInvited="onUserInvited"/>
    </div>

    <div v-if="!isLoading && !guild">
      <p>You are not a member of a guild. Accept an invitation to join a guild or found a new one.</p>

      <router-link to="/guild/create" class="btn btn-info">
        <i class="fas fa-users"></i> Create a Guild
      </router-link>

      <h4 class="mt-3">Guild Invites</h4>

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

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'guild-new-invite': GuildNewInvite,
    'guild-invite': GuildInvite,
    'guild-member': GuildMember
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
      return this.guild.leader._id === this.$store.state.userId
    },
    isOfficer () {
      return this.guild.officers.find(x => x._id === this.$store.state.userId) != null
    }
  }
}
</script>

<style scoped>

</style>
