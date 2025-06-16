<template>
<div class="row pt-3 pb-3 mb-2">
    <div class="col">
        <h3 class="mb-0">{{ title }}</h3>
    </div>
    <div class="col-auto">
        <slot></slot>
        <a v-if="showSocialLinks" class="btn btn-outline-secondary ms-1" href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord">
          <i class="fab fa-discord"></i>
        </a>
        <a v-if="showSocialLinks" class="btn btn-outline-secondary ms-1" href="https://steamcommunity.com/app/1623930/discussions/" target="_blank" title="Forum">
          <i class="far fa-comments"></i>
        </a>
        <a class="btn btn-outline-info ms-1" :href="documentationUrl" target="_blank" title="How to Play">
          <i class="far fa-question-circle"></i>
          <span class="d-none d-md-inline-block ms-1">How to Play</span>
        </a>
        <button v-if="navigation && !hideHomeButton" @click="navigate" id="btnHome" class="btn btn-info ms-1"><i v-bind:class="'fas fa-' + icon"></i></button>
    </div>
</div>
</template>

<script setup lang="ts">
import router from '../../router'
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import { computed } from 'vue';

type Props = {
  title: string,
  navigation?: string,
  icon?: string,
  hideHomeButton?: boolean,
  showSocialLinks?: boolean,
};

const { title, navigation  = "main-menu", icon = "home", hideHomeButton, showSocialLinks } = defineProps<Props>();

const store: Store<State> = useStore();

const isLoggedIn = computed(() => Boolean(store.state.userId));

const documentationUrl = import.meta.env.VUE_APP_DOCUMENTATION_URL;

const navigate = () => {
  if (isLoggedIn.value) {
    router.push({ name: navigation });
  } else {
    router.push({ name: 'home' })
  }
}
;
</script>

<style scoped>
h2 {
    margin-bottom: 0;
}
</style>
