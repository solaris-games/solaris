<template>
<div>
    <view-container-top-bar v-if="!hideTopBar"/>
    <logo></logo>
    <div class="container bg-dark pb-3 col-xs-12 col-sm-10 col-md-10 col-lg-6">
        <slot></slot>
        <footer class="mt-3">
          <div class="row">
            <div class="col">
                <a href="https://github.com/mike-eason/solaris" target="_blank">
                  <i class="fab fa-github"></i>
                  Source Code
                </a>
                |
                <a href="https://discord.com/invite/v7PD33d" target="_blank">
                  <i class="fab fa-discord"></i>
                  Discord
                </a>
            </div>
            <div class="col-auto">
                <a href="https://www.buymeacoffee.com/hyperi0n" target="_blank" class="text-warning">
                  <i class="fas fa-coffee"></i>
                  Donate
                </a>
            </div>
          </div>
        </footer>
    </div>
    <div class="mb-3 d-none d-md-block"></div>
</div>
</template>

<script>
import LogoVue from '../components/Logo'
import ViewContainerTopBarVue from './ViewContainerTopBar.vue'

export default {
  props: {
    hideTopBar: Boolean
  },
  components: {
    'logo': LogoVue,
    'view-container-top-bar': ViewContainerTopBarVue
  }
}
</script>
