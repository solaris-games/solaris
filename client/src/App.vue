<template>
  <main>
    <confirmation-dialog :dialogSettings="$store.state.confirmationDialog" />
    <router-view/>
  </main>
</template>

<script>
import ConfirmationDialog from './components/modal/ConfirmationDialog'

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

@media(max-width: 473px) {
    .menu-page {
      margin-bottom:52px; /* This is to cater for the bottom bar */
    }
}
</style>
