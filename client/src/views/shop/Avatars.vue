<template>
  <view-container :is-auth-page="true">
    <view-title title="Avatar Shop" />

    <p>Unlock new races to play with <strong class="text-warning">Galactic Credits</strong>. <router-link :to="{ name: 'galactic-credits-shop'}"><i class="fas fa-shopping-basket"></i> Purchase Galactic Credits</router-link> or earn credits by winning official games.</p>
    <h5 v-if="userCredits">You have <span class="text-warning"><strong>{{userCredits.credits}}</strong> Galactic Credits</span>.</h5>

    <hr />

    <loading-spinner v-if="isLoading" />

    <div v-if="avatars">
      <div class="row mb-4" v-for="avatar in sortedAvatars" :key="avatar.id">
        <div class="col-auto">
          <img :src="getAvatarImage(avatar)" width="128" height="128">
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              <h5>{{avatar.name}}<span class="badge bg-success ms-2" v-if="avatar.isPatronAvatar"><i class="fas fa-handshake"></i> Patron Avatar</span></h5>
            </div>
            <div class="col-auto">
              <button class="btn btn-sm btn-success" v-if="!avatar.purchased && userCredits.credits >= avatar.price" @click="purchaseAvatar(avatar)">
                <i class="fas fa-shopping-basket"></i> {{avatar.price}} Credit<span v-if="avatar.price > 1">s</span>
              </button>
              <router-link :to="{ name: 'galactic-credits-shop'}" class="btn btn-sm btn-outline-danger" v-if="!avatar.purchased && userCredits.credits < avatar.price">
                <i class="fas fa-coins"></i> {{avatar.price}} Credit<span v-if="avatar.price > 1">s</span>
              </router-link>
              <h5><span class="badge bg-primary" v-if="avatar.purchased"><i class="fas fa-check"></i> Unlocked</span></h5>
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
import ViewTitle from '../components/ViewTitle.vue'
import ViewContainer from '../components/ViewContainer.vue'
import UserApiService from '../../services/api/user'
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinnerVue
  },
  data () {
    return {
        isLoading: false,
        userCredits: null,
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
        let response = await UserApiService.getUserCredits()

        if (response.status === 200) {
            this.userCredits = response.data

            this.$store.commit('setUserCredits', response.data.credits)
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

      if (!(await this.$confirm(`Purchase Avatar`, `Are you sure you want to purchase this avatar for ${avatar.price} credits?`))) {
        return
      }

      avatar.isLoading = true

      try {
        let response = await UserApiService.purchaseAvatar(avatar.id)

        if (response.status === 200) {
          avatar.purchased = true
          this.userCredits.credits -= avatar.price

          this.$store.commit('setUserCredits', this.userCredits.credits)
        }
      } catch (err) {
        console.error(err)
      }

      avatar.isLoading = false
    },
    getAvatarImage (avatar) {
      try {
        return new URL(`../../assets/avatars/${avatar.file}`, import.meta.url).href
      } catch (err) {
        console.error(err)

        return null
      }
    }
  },
  computed: {
    sortedAvatars: function () {
      return this.avatars.sort((a, b) => a.isPatronAvatar - b.isPatronAvatar)
    }
  }
}
</script>

<style scoped>
.linebreaks {
  white-space: break-spaces;
}
</style>
