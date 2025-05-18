<template>
  <view-container :is-auth-page="true">
    <view-title :title="guild ? guildFullName : 'Guild'" />

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && guild" class="mb-4">
      <p class="float-end">Total Rank Points: <span class="text-warning">{{guild.totalRank}}</span></p>

      <h5 class="mb-0">Guild Roster</h5>

      <p class="mb-2"><small class="text-warning">Total Members: {{1 + guild.officers.length + guild.members.length}}</small></p>

      <guild-member-list :guild="guild">
        <template v-slot:default="{ value, getColumnClass }">
          <tr>
            <td>
                <router-link :to="{ name: 'account-achievements', params: { userId: value._id }}">{{value.username}}</router-link>
            </td>
            <td :class="getRoleClass(value.role, getColumnClass)">{{getRoleName(value.role)}}</td>
            <td align="right" :class="getColumnClass('rank')">{{value.achievements.rank}}</td>
            <td align="right" :class="getColumnClass('victories')">{{value.achievements.victories}}</td>
            <td align="right" :class="getColumnClass('renown')">{{value.achievements.renown}}</td>
          </tr>
        </template>
      </guild-member-list>
    </div>
  </view-container>
</template>
<script>
import ViewContainer from '../components/ViewContainer.vue';
import ViewTitle from '../components/ViewTitle.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import GuildApiService from '../../services/api/guild';
import GuildMemberList from './components/MemberList.vue';

export default {
  components: {
    'view-container': ViewContainer,
    'loading-spinner': LoadingSpinner,
    'view-title': ViewTitle,
    'guild-member-list': GuildMemberList
  },
  data () {
    return {
      guild: null,
      isLoading: true
    }
  },
  async mounted () {
    const guildId = this.$route.params.guildId;
    await this.loadGuild(guildId);
  },
  methods: {
    async loadGuild (guildId) {
      this.isLoading = true;
      try {
        const response = await GuildApiService.details(guildId);

        if (response.status === 200) {
          this.guild = response.data;
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false;
    },
    getRoleName (role) {
      return role.charAt(0).toUpperCase() + role.slice(1);
    },
    getRoleClass (role, getColumnClass) {
      return {
        'text-warning': role === 'leader',
        'text-info': role === 'officer',
        'text-danger': role === 'invitee',
        ...getColumnClass('role')
      }
    }
  },
  computed: {
    guildFullName () {
      return `${this.guild.name} [${this.guild.tag}]`
    },
  },
  watch: {
    '$route.params.guildId': {
      handler: (_oldVal, newVal) => {
        this.loadGuild(newVal);
      }
    }
  }
}

</script>
<style scoped>

</style>
