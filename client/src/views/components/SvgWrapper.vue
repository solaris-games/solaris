<template>
  <Suspense>
    <SvgWrapperInternal :href="href" v-bind="$attrs" />

    <template #fallback>
      <span>.</span>
    </template>
  </Suspense>
</template>
<script>
import SvgWrapperInternal from './SvgWrapperInternal.vue';

export default {
  components: {
    SvgWrapperInternal
  },
  props: {
    href: null
  },
}

</script>

<style scoped>
</style>
