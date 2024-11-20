<template>
  <!--<div>
    ${iconSource}
  </div>-->
  <!--<img style="fill: red" :src="iconSource" width="24" height="24" title="Star">-->
  <!--Use CSS property (ie variable)-->
  <!--<svg viewBox="0 0 512 512" class="whatever" title="Star">
    <use href="../../../../assets/map-objects/128x128_star_scannable_binary.svg#128x128_star_scannable_binary" width="512" height="512" stroke="red" />
  </svg>-->
  <!--TODO: Combo-stars, ie stars with more than one type.-->
  <svg-wrapper v-if="isBinaryStar" :href="iconSource" class="star-svg binaryStarIcon"></svg-wrapper>
  <!--<i v-else-if="isNebula" class="fas fa-eye-slash"></i>-->
  <div v-else-if="isNebula" class="imageMask nebulaIcon" :style="iconSource" />
  <i v-else-if="isBlackHole" class="far fa-circle"></i>
  <i v-else-if="isAsteroidField" class="fas fa-meteor"></i>
  <!--<div v-else-if="isAsteroidField" class="imageMask asteroidIcon" :style="iconSource" />-->
  <svg-wrapper v-else-if="isPulsar" :href="iconSource" class="star-svg"></svg-wrapper>
  <div v-else-if="isWormHole" class="imageMask wormHoleIcon" :style="iconSource" />
</template>

<script>
import SvgWrapperVue from '../../../components/SvgWrapper.vue'
export default {
  components: {
    'svg-wrapper': SvgWrapperVue
  },
  props: {
    isAsteroidField: false,
    isBinaryStar: false,
    isNebula: false,
    isBlackHole: false,
    isPulsar: false,
    isWormHole: false
  },
  computed: {
    iconSource() {
      // TODO: Combos?
     if (this.isBinaryStar) {
        return new URL(`../../../../assets/map-objects/128x128_star_scannable_binary.svg`, import.meta.url).href;
      }
      else if (this.isNebula) {
       return `mask-image: url(${new URL(`../../../../assets/nebula/neb0-starless-bright.png`, import.meta.url)}); -webkit-mask-image: url(${new URL(`../../../../assets/nebula/neb0-starless-bright.png`, import.meta.url)});`;
      }
      else if (this.isBlackHole) {
        return new URL(`../../../../assets/map-objects/128x128_star_black_hole.svg`, import.meta.url).href;
      }
      else if (this.isPulsar) {
        return new URL(`../../../../assets/stars/128x128_star_pulsar.svg`, import.meta.url).href;
      }
      else if (this.isWormHole) {
       return `mask-image: url(${new URL(`../../../../assets/stars/vortex.png`, import.meta.url).href}); -webkit-mask-image: url(${new URL(`../../../../assets/stars/vortex.png`, import.meta.url).href});`;
      }
      else {
        return new URL(`../../../../assets/map-objects/128x128_star_scannable.svg`, import.meta.url).href;
      }
    }
  }
}
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
