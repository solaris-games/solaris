<template>
    <router-view/>
</template>

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
  margin-bottom:52px;
}
</style>
