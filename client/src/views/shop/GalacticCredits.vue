<template>
  <view-container :is-auth-page="true">
    <view-title title="Galactic Credit Packs" />

    <p>
      Purchase <span class="text-warning">Galactic Credits</span> to spend in the <router-link :to="{ name: 'avatars'}"><i class="fas fa-shopping-basket"></i> Avatar Store</router-link> or award <strong>Badges</strong> to players!
    </p>

    <p>
      By purchasing packs, you help support the continued development of <strong>Solaris</strong>, any purchase will award you with the <span class="text-info"><i class="fas fa-hands-helping"></i> Contributor</span> badge on your player profile.
    </p>

    <h5 v-if="userCredits">You have <span class="text-warning"><strong>{{userCredits.credits}}</strong> Galactic Credits</span>.</h5>

    <hr/>

    <loading-spinner :loading="isLoading"/>

    <div class="card-group mb-3 text-center">
      <div class="card m-1 box-shadow">
        <div class="card-header">
          <h4 class="my-0 font-weight-normal">Pathfinder</h4>
        </div>
        <div class="card-body">
          <h2 class="card-title pricing-card-title"><i class="fas fa-coins"></i> 1</h2>
          <ul class="list-unstyled mt-3 mb-3">
            <li>1 Galactic Credit</li>
            <li><small class="text-muted">Just One</small></li>
          </ul>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-lg btn-outline-default" @click="buyCreditPack(1)" :disabled="isLoading"><i class="fas fa-money-bill-wave"></i> £1</button>
          </div>
        </div>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
      </div>
      <div class="card m-1 box-shadow">
        <div class="card-header bg-primary">
          <h4 class="my-0 font-weight-normal">Lieutenant</h4>
        </div>
        <div class="card-body">
          <h2 class="card-title pricing-card-title"><i class="fas fa-coins"></i> 5</h2>
          <ul class="list-unstyled mt-3 mb-3">
            <li>5 Galactic Credits</li>
            <li><small class="text-muted">Recommended</small></li>
          </ul>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-lg btn-primary" @click="buyCreditPack(5)" :disabled="isLoading"><i class="fas fa-money-bill-wave"></i> £5</button>
          </div>
        </div>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
      </div>
      <div class="card m-1 box-shadow">
        <div class="card-header bg-success">
          <h4 class="my-0 font-weight-normal">Admiral</h4>
        </div>
        <div class="card-body">
          <h2 class="card-title pricing-card-title"><i class="fas fa-coins"></i> 10</h2>
          <ul class="list-unstyled mt-3 mb-3">
            <li>10 Galactic Credits</li>
            <li><small class="text-muted">10% off</small></li>
          </ul>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-lg btn-success" @click="buyCreditPack(10)" :disabled="isLoading"><i class="fas fa-money-bill-wave"></i> £9</button>
          </div>
        </div>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
      </div>
    </div>

    <div class="card-group mb-3 text-center">
      <div class="card m-1 box-shadow">
        <div class="card-header bg-info">
          <h4 class="my-0 font-weight-normal">Colonel</h4>
        </div>
        <div class="card-body">
          <h2 class="card-title pricing-card-title"><i class="fas fa-coins"></i> 25</h2>
          <ul class="list-unstyled mt-3 mb-3">
            <li>25 Galactic Credits</li>
            <li><small class="text-muted">20% off</small></li>
          </ul>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-lg btn-info" @click="buyCreditPack(25)" :disabled="isLoading"><i class="fas fa-money-bill-wave"></i> £20</button>
          </div>
        </div>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
      </div>
      <div class="card m-1 box-shadow">
        <div class="card-header bg-warning">
          <h4 class="my-0 font-weight-normal">General</h4>
        </div>
        <div class="card-body">
          <h2 class="card-title pricing-card-title"><i class="fas fa-coins"></i> 50</h2>
          <ul class="list-unstyled mt-3 mb-3">
            <li>50 Galactic Credits</li>
            <li><small class="text-muted">30% off</small></li>
          </ul>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-lg btn-warning" @click="buyCreditPack(50)" :disabled="isLoading"><i class="fas fa-money-bill-wave"></i> £35</button>
          </div>
        </div>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
      </div>
      <div class="card m-1 box-shadow">
        <div class="card-header bg-danger">
          <h4 class="my-0 font-weight-normal">Destroyer</h4>
        </div>
        <div class="card-body">
          <h2 class="card-title pricing-card-title"><i class="fas fa-coins"></i> 100</h2>
          <ul class="list-unstyled mt-3 mb-3">
            <li>100 Galactic Credits</li>
            <li><small class="text-muted">50% off</small></li>
          </ul>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-lg btn-danger" @click="buyCreditPack(100)" :disabled="isLoading"><i class="fas fa-money-bill-wave"></i> £50</button>
          </div>
        </div>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
      </div>
    </div>
  </view-container>
</template>

<script>
import ViewTitle from '../components/ViewTitle.vue'
import ViewContainer from '../components/ViewContainer.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ShopApiService from '../../services/api/shop'
import { getCredits } from '@/services/typedapi/user'
import { httpInjectionKey, isOk } from '@/services/typedapi'
import { inject } from 'vue'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
  },
  setup () {
    return {
      httpClient: inject(httpInjectionKey),
    };
  },
  data () {
    return {
      isLoading: false,
      userCredits: null,
    }
  },
  async mounted () {
    this.isLoading = true
    await this.loadGalacticCredits()
    this.isLoading = false
  },
  methods: {
    async loadGalacticCredits () {
      try {
        const response = await getCredits(this.httpClient)();

        if (isOk(response)) {
            this.userCredits = response.data

            this.$store.commit('setUserCredits', response.data.credits)
        }
      } catch (err) {
          console.error(err)
      }
    },
    async buyCreditPack (credits) {
      this.isLoading = true

      try {
        let response = await ShopApiService.purchaseGalacticCredits(credits)

        if (response.status === 200) {
          window.location = response.data.approvalUrl
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
</style>
