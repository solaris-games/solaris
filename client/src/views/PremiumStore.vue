<template>
  <div class="container bg-light">
    <view-title title="Premium Membership" />

    <h3>Premium Memberships</h3>

    <div v-for="membership in premiumMemberships" v-bind:key="membership.name">
      <p>{{membership.name}}: £{{membership.price}}</p>
      <p>{{membership.caption}}</p>
      <button @click="buyMembership(membership)" class="btn btn-success">Buy Now</button>
    </div>

    <hr>

    <h3>Galactic Credit Packs</h3>

    <div v-for="pack in creditPacks" v-bind:key="pack.name">
      <p>{{pack.name}}: £{{pack.price}}</p>
      <p>{{pack.caption}}</p>
      <button @click="buyCreditPack(pack)" class="btn btn-success">Buy Now</button>
    </div>
  </div>
</template>

<script>
import ViewTitle from '../components/ViewTitle'

export default {
  components: {
    'view-title': ViewTitle
  },
  data () {
    return {
      premiumMemberships: [
        {
          name: 'Scout',
          price: 12,
          caption: null
        },
        {
          name: 'Captain',
          price: 24,
          caption: 'Only £2 per month!'
        },
        {
          name: 'Admiral',
          price: 48,
          caption: 'Play forever!*'
        }
      ],
      creditPacks: [
        {
          name: '1 Galactic Credit',
          price: 1,
          credits: 1,
          caption: null
        },
        {
          name: '10 Galactic Credits',
          price: 10,
          credits: 10,
          caption: null
        },
        {
          name: '20 Galactic Credits',
          price: 20,
          credits: 1,
          caption: null
        },
        {
          name: '50 Galactic Credits',
          price: 45,
          credits: 1,
          caption: '10% Dicount!'
        },
        {
          name: '100 Galactic Credits',
          price: 80,
          credits: 1,
          caption: '20% Dicount!'
        }
      ]
    }
  },
  methods: {
    buyMembership (membership) {
      // TODO: Redirect to 3rd party payment provider.
      console.log(membership.name)
    },
    buyCreditPack (pack) {
      // TODO: Redirect to 3rd party payment provider.
      console.log(pack.name)
    }
  }
}
</script>

<style scoped>
</style>
