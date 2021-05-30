<template>
  <view-container>
    <view-title :title="guild ? guildFullName : 'Guild'" />

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && guild" class="mb-4">
      <p class="float-right">Total Rank: <span class="text-warning">{{guild.totalRank}}</span></p>

      <h5>Members</h5>
    </div>
  </view-container>
</template>
<script>
import ViewContainer from '../../components/ViewContainer';
import LoadingSpinner from '../../components/LoadingSpinner';
import GuildApiService from '../../services/api/guild'

export default {
  components: {
    'view-container': ViewContainer,
    'loading-spinner': LoadingSpinner
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
      this.loading = true;
      try {
        const response = GuildApiService.details(guildId);

        if (response.status === 200) {
          this.guild = response.data;
        }
      } catch (err) {
        console.error(err)
      }

      this.loading = false;
    }
  },
  computed: {
    guildFullName () {
      return `${this.guild.name} [${this.guild.tag}]`
    },
  }
}

</script>
<style scoped>

</style>