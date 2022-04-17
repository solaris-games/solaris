<template>
  <main>
    <confirmation-dialog :dialogSettings="$store.state.confirmationDialog" />
    <router-view/>
  </main>
</template>

<script>
import ConfirmationDialog from './views/components/modal/ConfirmationDialog'

export default {
  components: {
    'confirmation-dialog': ConfirmationDialog
  }
}
</script>

<style>
body {
    font-family: 'Space Mono', monospace !important;
}

/* Animations */
@keyframes fadeInAnimation {
  from {opacity: 0;}
  to {opacity: 1;}
}

.menu-page {
  opacity: 1;
  animation-name: fadeInAnimation;
  animation-duration: 0.3s;
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
</style>
