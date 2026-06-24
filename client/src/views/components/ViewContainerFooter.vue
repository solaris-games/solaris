<template>
  <footer class="solaris-footer">
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
        <a :href="wikiUrl" target="_blank" class="text-info">Wiki</a>
        |
        <router-link :to="{ name: 'galactic-credits-shop'}" class="text-success"><i
          class="fas fa-shopping-basket me-1"></i>Shop
        </router-link>
        |
        <a href="https://www.redbubble.com/shop/ap/82527983" target="_blank" class="text-info"><i
          class="fas fa-tshirt me-1"></i>Swag</a>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
const wikiUrl = import.meta.env.VUE_APP_WIKI_URL;
</script>
<style scoped>
.solaris-footer {
  background-color: rgba(29,40,53,.95);
  flex-shrink: 0;
  height: 2.5rem;
  padding: 0.5rem;
  display: flex;
  justify-content: center;
}
</style>
