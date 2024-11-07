<template>
  <main>
    <ConfirmationDialog :dialogSettings="$store.state.confirmationDialog" />
    <router-view/>
  </main>
</template>

<script setup lang="ts">
import ConfirmationDialog from './views/components/modal/ConfirmationDialog.vue';
</script>

<style>
/* Animations */
@keyframes fadeInAnimation {
  from {opacity: 0;}
  to {opacity: 1;}
}

.menu-page {
  opacity: 1;
  animation-name: fadeInAnimation;
  animation-duration: 0.3s;
  background-color: rgba(29,40,53,.98);
}

.header-bar-bg {
  background-color: rgba(29,40,53,.98);
}

/* Scroll Bar */
/* Track */
::-webkit-scrollbar-track {
  background: #303030;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #375a7f;
}

/* I dunno what this is all about but for some reason content inside cards has a high z-index and this causes popovers to appear underneath them. */
.card>:not(.card-arrow):not(.card-img-overlay):not(.card-img):not(.hljs-container) {
  z-index: 0 !important;
}

/* Option backgrounds are always white in Chrome */
option {
  background: rgba(29,40,53,.98);
}

/* For some reason the box shadow on cards displays on top of the card */
.card::after {
  z-index: -10 !important;
}

/* Prevent card arrow from receiving pointer events */
.card-arrow {
  pointer-events: none;
}
</style>
