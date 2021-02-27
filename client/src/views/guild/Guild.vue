<template>
  <view-container>
    <view-title :title="guild ? guildFullName : 'Guild'" />

    <loading-spinner :loading="!guild"/>

    <div v-if="guild">
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
                <guild-member :guild="guild" :player="guild.leader" role="Leader"/>

                <guild-member :guild="guild" :player="officer" role="Officer"
                  v-for="officer in guild.officers" :key="officer._id"/>

                <guild-member :guild="guild" :player="member" role="Member"
                  v-for="member in guild.members" :key="member._id"/>

                <guild-member :guild="guild" :player="invitee" role="Invitee"
                  v-for="invitee in guild.invitees" :key="invitee._id"/>
              </tbody>
          </table>
      </div>

      <guild-invite v-if="isLeader || isOfficer"
        :guildId="this.guild._id"
        @onUserInvited="onUserInvited"/>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../../components/ViewContainer'
import ViewTitle from '../../components/ViewTitle'
import LoadingSpinner from '../../components/LoadingSpinner'
import GuildApiService from '../../services/api/guild'
import GuildInvite from './GuildInvite'
import GuildMember from './GuildMember'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'guild-invite': GuildInvite,
    'guild-member': GuildMember
  },
  data () {
    return {
      guild: null
    }
  },
  async mounted () {
    this.guild = null

    try {
      let response = await GuildApiService.detail(this.$route.params.guildId)

      if (response.status === 200) {
        this.guild = response.data
      }
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    onUserInvited (e) {
      this.guild.invitees.push(e)
    },
    isCurrentUser (userId) {
      return userId === this.$store.state.userId
    },
    async kick (userId) {

    },
    async uninvite (userId) {

    },
    async leave () {

    },
    async disband () {

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
