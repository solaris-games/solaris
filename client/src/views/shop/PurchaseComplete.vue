<template>
  <view-container :is-auth-page="true">
    <view-title title="Purchase Complete" />

    <p>Thank you for your purchase, it goes a long way to help support continued development of <strong>Solaris</strong>.</p>

    <p>Head on over to the <router-link :to="{ name: 'avatars'}"><i class="fas fa-shopping-basket"></i> Avatar Store</router-link> to spend your credits!</p>
  </view-container>
</template>

<script setup lang="ts">
import ViewTitle from '../components/ViewTitle.vue'
import ViewContainer from '../components/ViewContainer.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()

onMounted(() => {
    let credits = +route.query.credits!
    store.commit('setUserCredits', store.state.userCredits + credits)
})
</script>

<style scoped>
</style>
