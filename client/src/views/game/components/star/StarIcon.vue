<template>
  <!--TODO: Combo-stars, ie stars with more than one type.-->
  <svg-wrapper v-if="isBinaryStar" :icon-name="iconSource" class="star-svg binaryStarIcon"></svg-wrapper>
  <div v-else-if="isNebula" class="imageMask nebulaIcon" :style="iconSource" />
  <i v-else-if="isBlackHole" class="far fa-circle"></i>
  <i v-else-if="isAsteroidField" class="fas fa-meteor"></i>
  <svg-wrapper v-else-if="isPulsar" :icon-name="iconSource" class="star-svg"></svg-wrapper>
  <div v-else-if="isWormHole" class="imageMask wormHoleIcon" :style="iconSource" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SvgWrapper from '../../../components/SvgWrapper.vue';

const props = defineProps<{
  isAsteroidField?: boolean,
  isBinaryStar?: boolean,
  isNebula?: boolean,
  isBlackHole?: boolean,
  isPulsar?: boolean,
  isWormHole?: boolean,
}>();

const iconSource = computed(() => {
  // TODO: Combos?
  if (props.isBinaryStar) {
    return "128x128_star_scannable_binary";
  }
  else if (props.isNebula) {
    return `mask-image: url(${new URL(`../../../../assets/map-objects-symbols/neb0-starless-bright.png`, import.meta.url)}); -webkit-mask-image: url(${new URL(`../../../../assets/nebula/neb0-starless-bright.png`, import.meta.url)});`;
  }
  else if (props.isBlackHole) {
    return "128x128_star_black_hole";
  }
  else if (props.isPulsar) {
    return "128x128_star_pulsar";
  }
  else if (props.isWormHole) {
    return `mask-image: url(${new URL(`../../../../assets/map-objects-symbols/vortex.png`, import.meta.url).href}); -webkit-mask-image: url(${new URL(`../../../../assets/stars/vortex.png`, import.meta.url).href});`;
  }
  else {
    return "128x128_star_scannable";
  }
});

</script>

<style>
  .star-svg {
    width: 15px;
    height: 15px;
  }
  .star-svg .star {
    fill: currentColor;
  }
  .star-svg .pulsar {
    stroke: currentColor;
  }
  .star-svg .black-hole {
    fill: transparent;
    stroke: currentColor;
  }
  .imageMask {
    width: 15px;
    height: 15px;
    background-color: currentColor;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: 100%;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: 100%;
  }

  .nebulaIcon, .wormHoleIcon {
    width: 18px;
    height: 18px;
    display: inline-block;
    vertical-align: bottom;
  }

  .nebulaIcon {
    filter: contrast(5);
    margin-bottom: 2px;
  }

  .binaryStarIcon {
    margin-bottom: 2px;
  }

  .wormHoleIcon {
    margin-bottom: 1px;
    margin-left: auto;
    margin-right: auto;
  }

  .asteroidIcon {
    object-fit: cover;
    filter: contrast(5);
  }
</style>
