<template>
<!--  id="content" class="app-content" -->
<div id="content">
    <view-container-top-bar v-if="!hideTopBar"/>
    <!-- <logo></logo> -->
    <div class="container pb-3 col-xs-12 col-sm-10 col-md-10 col-lg-6">
        <slot></slot>
        <footer class="mt-3">
          <div class="row">
            <div class="col">
                <router-link :to="{ name: 'privacy-policy'}" class="me-2" title="Privacy Policy">
                  <i class="fas fa-file-alt"></i>
                </router-link>
                <a href="https://github.com/solaris-games/solaris" target="_blank" title="Code" class="me-2">
                  <i class="fab fa-github"></i>
                </a>
                <a href="https://store.steampowered.com/app/1623930/Solaris/" target="_blank" title="Steam" class="me-2">
                  <i class="fab fa-steam"></i>
                </a>
                <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" class="me-2">
                  <i class="fab fa-discord"></i>
                </a>
                <a href="https://steamcommunity.com/app/1623930/discussions/" target="_blank" title="Forum" class="me-2">
                  <i class="far fa-comments"></i>
                </a>
            </div>
            <div class="col-auto">
                <router-link :to="{ name: 'galactic-credits-shop'}" class="text-success"><i class="fas fa-shopping-basket me-1"></i>Shop</router-link>
                |
                <a href="https://www.redbubble.com/shop/ap/82527983" target="_blank" class="text-info"><i class="fas fa-tshirt me-1"></i>Swag</a>
                |
                <a href="https://www.buymeacoffee.com/limitingfactor" target="_blank" class="text-warning"><i class="fas fa-coffee me-1"></i>Donate</a>
            </div>
          </div>
        </footer>
    </div>
    <div class="mb-3 d-none d-md-block"></div>
</div>
</template>

<script>
import LogoVue from './Logo.vue'
import ViewContainerTopBarVue from './ViewContainerTopBar.vue'

export default {
  props: {
    isAuthPage: Boolean,
    hideTopBar: Boolean
  },
  components: {
    'logo': LogoVue,
    'view-container-top-bar': ViewContainerTopBarVue
  },
  async mounted() {
    if (this.isAuthPage && !this.$store.state.userId) {
      await this.$store.dispatch('verify')
    }
  }
}
</script>

<style scoped>
#content {
  padding-top: 52px;
}
</style>
