<template>
  <view-container>
    <view-title title="Avatar Store" />

    <p>Unlock new races to play with <strong class="text-warning">Galactic Credits</strong> which can be earned by winning official games.</p>
    <p v-if="userInfo">You have <span class="text-warning"><strong>{{userInfo.credits}}</strong> Galactic Credits</span>.</p>

    <hr />

    <loading-spinner v-if="isLoading" />

    <div v-if="avatars">
      <div class="row mb-4" v-for="avatar in avatars" :key="avatar.id">
        <div class="col-auto">
          <img :src="getAvatarImage(avatar)" width="128" height="128">
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              <h5>{{avatar.name}}</h5>
            </div>
            <div class="col-auto">
              <button class="btn btn-sm btn-success" v-if="!avatar.purchased" :disabled="userInfo.credits < avatar.price" @click="purchaseAvatar(avatar)">
                <i class="fas fa-shopping-basket"></i> {{avatar.price}} Credit<span v-if="avatar.price > 1">s</span>
              </button>
              <span class="badge badge-primary" v-if="avatar.purchased"><i class="fas fa-check"></i> Unlocked</span>
            </div>
            <div class="col-12">
              <p><small class="linebreaks">{{avatar.description}}</small></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </view-container>
</template>

<script>
import ViewTitle from '../components/ViewTitle'
import ViewContainer from '../components/ViewContainer'
import UserApiService from '../services/api/user'
import LoadingSpinnerVue from '../components/LoadingSpinner'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinnerVue
  },
  data () {
    return {
        isLoading: false,
        userInfo: null,
        avatars: []
    }
  },
  async mounted () {
    this.isLoading = true
    await this.loadGalacticCredits()
    await this.loadAvatars()
    this.isLoading = false
  },
  methods: {
    async loadGalacticCredits () {
      try {
        let response = await UserApiService.getMyUserInfo()

        if (response.status === 200) {
            this.userInfo = response.data
        }
      } catch (err) {
          console.error(err)
      }
    },
    async loadAvatars () {
      try {
        let response = await UserApiService.getUserAvatars()

        if (response.status === 200) {
          this.avatars = response.data
        }
      } catch (err) {
        console.error(err)
      }
    },
    async purchaseAvatar (avatar) {
      if (avatar.purchased) {
        return
      }

      if (!(await this.$confirm(`Purchase Avatar`, `Are you sure you want to purchase this avatar for ${avatar.price} credit(s)?`))) {
        return
      }

      avatar.isLoading = true

      try {
        let response = await UserApiService.purchaseAvatar(avatar.id)

        if (response.status === 200) {
          avatar.purchased = true
          this.userInfo.credits -= avatar.price
        }
      } catch (err) {
        console.error(err)
      }

      avatar.isLoading = false
    },
    getAvatarImage (avatar) {
      try {
        return require('../assets/avatars/' + avatar.id.toString() + '.png')
      } catch (err) {
        console.error(err)

        return null
      }
    }
  }
}
</script>

<style scoped>
.linebreaks {
  white-space: break-spaces;
}
</style>
