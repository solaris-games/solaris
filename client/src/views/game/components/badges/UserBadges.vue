<template>
<div>
    <loading-spinner :loading="isLoading" />

    <div class="pt-3 pb-3 text-center" v-if="!isLoading && userHasBadges">
        <badge v-for="badge in badges" :key="badge.key" :badge="badge" />
    </div>
</div>
</template>

<script>
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import Badge from './Badge.vue'
import BadgeApiService from '../../../../services/api/badge'

export default {
    components: {
        'loading-spinner': LoadingSpinner,
        'badge': Badge
    },
  props: {
    userId: String
  },
  data () {
    return {
        isLoading: false,
        badges: []
    }
  },
  async mounted () {
    await this.loadUserBadges()
  },
  methods: {
    async loadUserBadges () {
        this.isLoading = true

        try {
            let response = await BadgeApiService.listBadgesByUser(this.userId)

            if (response.status === 200) {
                this.badges = response.data
            } else {
                this.badges = null
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoading = false
    }
  },
  computed: {
    userHasBadges () {
        return this.badges.filter(b => b.awarded).length
    }
  }
}
</script>

<style scoped>
</style>
