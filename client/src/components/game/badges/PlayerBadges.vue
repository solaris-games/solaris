<template>
<div>
    <loading-spinner :loading="isLoading" />
<!-- 
    <div class="row bg-primary" v-if="!isLoading || !userHasBadges">
        <div v-if="!userHasBadges" class="col text-center pt-3">
            <p class="mb-3">This player has no badges.</p>
        </div>
    </div> -->

    <div class="row bg-secondary" v-if="!isLoading && userPlayer && playerId !== userPlayer._id">
        <div class="col text-center pt-3">
            <p class="mb-3">Buy this player a <a href="javascript:;" @click="onOpenPurchasePlayerBadgeRequested">Badge of Honor</a>.</p>
        </div>
    </div>

    <div class="pt-3 pb-3" v-if="!isLoading && userHasBadges">
        <div class="badge-container" v-for="badge in filteredBadges" :key="badge.key" @click="onOpenPurchasePlayerBadgeRequested">
            <img :src="require(`../../../assets/badges/${badge.key}.png`)" :title="badge.name"/>
            <span class="badge-label" :title="badge.name">{{badge.awarded}}</span>
        </div>
    </div>
</div>
</template>

<script>
import LoadingSpinner from '../../LoadingSpinner'
import BadgeApiService from '../../../services/api/badge'
import GameHelper from '../../../services/gameHelper'

export default {
    components: {
        'loading-spinner': LoadingSpinner
    },
  props: {
    playerId: String
  },
  data () {
    return {
        isLoading: false,
        badges: []
    }
  },
  async mounted () {
    await this.loadPlayerBadges()
  },
  methods: {
    onOpenPurchasePlayerBadgeRequested () {
        this.$emit('onOpenPurchasePlayerBadgeRequested', this.playerId)
    },
    async loadPlayerBadges () {
        this.isLoading = true

        try {
            let response = await BadgeApiService.listBadgesByPlayer(this.$store.state.game._id, this.playerId)

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
      userPlayer () {
          return GameHelper.getUserPlayer(this.$store.state.game)
      },
    userHasBadges () {
        return this.badges.filter(b => b.awarded).length
    },
    filteredBadges () {
        return this.badges.filter(b => b.awarded)
    }
  }
}
</script>

<style scoped>
img {
    width: 110px;
    height: 110px;
}

@media screen and (max-width: 576px) {
    img {
        width: 95px;
        height: 95px;
    }
}

.badge-container {
    display: inline-block;
    position: relative;
    cursor: pointer;
}

.badge-label {
    position: absolute;
    right: 8px;
    top: 8px;
    font-size: 20px;
    background: #e74c3c;
    padding: 0px 8px;
    border-radius: 5px;
}
</style>
