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
/* Animations */
@keyframes fadeInAnimation {
  from {opacity: 0;}
  to {opacity: 1;}
}

.menu-page {
  opacity: 1;
  animation-name: fadeInAnimation;
  animation-duration: 0.3s;
  background-color: rgba(29,40,53,1);
}

.header-bar-bg {
  background-color: rgba(29,40,53,1);
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
