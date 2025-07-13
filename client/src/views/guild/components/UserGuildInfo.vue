<template>
    <div>
      <loading-spinner :loading="isLoadingGuild" />

      <div class="row bg-dark mb-2 pt-2 pb-2" v-if="!isLoadingGuild && user">
        <div class="col">
          <h5 class="mb-0 pt-2 pb-2">
            <span>Guild: </span>
            <span v-if="!user.guild && !isUserInvited" class="text-warning">None</span>
            <span v-if="!user.guild && isUserInvited">Invited to </span>
            <router-link v-if="user.guild" :to="{ name: 'guild-details', params: { guildId: user.guild._id }}">
                <span>{{user.guild.name}} [{{user.guild.tag}}]</span>
            </router-link>
            <router-link v-if="isUserInvited" :to="{ name: 'guild-details', params: { guildId: myGuild._id }}">
                <span>{{myGuild.name}} [{{myGuild.tag}}]</span>
            </router-link>
          </h5>
        </div>
        <div class="col-auto" v-if="!user.guild && myGuild && ownUserCanInvite && !isUserInvited">
          <button class="btn btn-success" @click="inviteUser" :disabled="isInvitingUser">
              <i class="fas fa-user-plus"></i>
              Invite to Guild
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import LoadingSpinnerVue from '../../components/LoadingSpinner.vue'
import GuildApiService from '../../../services/api/guild'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue
  },
  props: {
    user: Object
  },
  data () {
    return {
      isLoadingGuild: false,
      isInvitingUser: false,
      myGuild: null,
    }
  },
  async mounted () {
    await this.loadMyGuild()
  },
  methods: {
    async loadMyGuild () {
        this.isLoadingGuild = true

      try {
        const response = await GuildApiService.detailMyGuild()

        if (response.status === 200) {
          this.myGuild = response.data
        }
      } catch (err) {
        console.error(err)
      }

        this.isLoadingGuild = false
    },
    async inviteUser () {
      if (await this.$confirm('Invite to Guild', `Are you sure you want to invite ${this.user.username} to join your guild?`)) {
        this.isInvitingUser = true

        try {
          const response = await GuildApiService.invite(this.myGuild._id, this.user.username);

          if (response.status === 200) {
            this.$toast.default(`You invited ${this.user.username} to your guild.`, { type: 'success' })
          }
          await this.loadMyGuild();
        } catch (err) {
          console.log(err)
        }

        this.isInvitingUser = false
      }
    }
  },
  computed: {
    isUserInvited () {
      return this.myGuild && this.myGuild.invitees.find(inv => inv._id === this.user._id)
    },
    ownUserCanInvite () {
      return this.myGuild &&
          (this.myGuild.leader._id === this.$store.state.userId || this.myGuild.officers.find(x => x._id === this.$store.state.userId))
    }
  }
}
</script>

<style scoped>

</style>
