<template>
<div class="menu-page container">
    <menu-title title="Award Player Badge" @onCloseRequested="onCloseRequested">
        <button @click="onOpenPlayerDetailRequested" class="btn btn-sm btn-primary" title="Back to Player Profile"><i class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row bg-primary">
        <div class="col text-center pt-3">
            <p class="mb-1" v-if="recipientPlayer">Buy <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{recipientPlayer.alias}}</a> a <strong>Badge of Honor</strong>.</p>
            
            <p v-if="userInfo"><small>You have <span class="text-warning"><strong>{{userInfo.credits}}</strong> Galactic Credits</span>.</small></p>
        </div>
    </div>

    <loading-spinner :loading="isLoading"/>

    <div class="pt-3 pb-1">
        <div class="row mb-5" v-for="badge in badges" :key="badge.key">
            <div class="col-auto">
                <img :src="require(`../../../assets/badges/${badge.key}.png`)"/>

                <button class="btn btn-block btn-sm btn-success" :disabled="isLoading" v-if="userInfo.credits >= badge.price" @click="purchaseBadge(badge)">
                    <i class="fas fa-shopping-basket"></i> {{badge.price}} Credit<span v-if="badge.price > 1">s</span>
                </button>
                <router-link :to="{ name: 'galactic-credits-shop'}" :disabled="isLoading" class="btn btn-block btn-sm btn-danger" v-if="userInfo.credits < badge.price">
                    <i class="fas fa-coins"></i> {{badge.price}} Credit<span v-if="badge.price > 1">s</span>
                </router-link>
            </div>
            <div class="col">
                <h5>{{badge.name}}</h5>
                <p><small>{{badge.description}}</small></p>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import LoadingSpinner from '../../LoadingSpinner'
import BadgeApiService from '../../../services/api/badge'
import UserApiService from '../../../services/api/user'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner
  },
  props: {
    recipientPlayerId: String
  },
  data () {
    return {
        isLoading: false,
        userInfo: null,
        badges: [],
        recipientPlayer: null
    }
  },
  async mounted () {
        this.recipientPlayer = GameHelper.getPlayerById(this.$store.state.game, this.recipientPlayerId)

        await this.loadGalacticCredits()
        await this.loadBadges()
  },
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested () {
        this.$emit('onOpenPlayerDetailRequested', this.recipientPlayerId)
    },
    async loadGalacticCredits () {
        this.isLoading = true

        try {
            let response = await UserApiService.getMyUserInfo()

            if (response.status === 200) {
                this.userInfo = response.data
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoading = false
    },
    async loadBadges () {
        this.isLoading = true
            
        try {
            let response = await BadgeApiService.listBadges(this.$store.state.game._id)

            if (response.status === 200) {
                this.badges = response.data
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoading = false
    },
    async purchaseBadge (badge) {
        if (!await this.$confirm(`Purchase Badge`, `Are you sure you want to purchase the '${badge.name}' badge for ${this.recipientPlayer.alias}? It will cost ${badge.price} credit(s).`)) {
            return
        }

        this.isLoading = true
            
        try {
            let response = await BadgeApiService.purchaseBadgeForPlayer(this.$store.state.game._id, this.recipientPlayer._id, badge.key)

            if (response.status === 200) {
                this.$toasted.show(`You succesfully purchased the ${badge.name} badge for ${this.recipientPlayer.alias}!`, { type: 'success' })

                this.onOpenPlayerDetailRequested()
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoading = false
    }
  }
}
</script>

<style scoped>
img {
    width: 128px;
    height: 128px;
}
</style>
