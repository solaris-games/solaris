<template>
  <Suspense>
    <svgInner/>
  </Suspense>
</template>
<script setup lang="ts">
import {defineAsyncComponent, h, normalizeClass, normalizeStyle, Suspense, useAttrs} from 'vue'

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  iconName: string,
}>();

const attributes = useAttrs();

const horribleSvgGetBBox = (svg: SVGGraphicsElement) => {
  // This abomination is needed because getBBox() returns all zeroes if the SVG isn't currently "visible".
  // Based on the answers from here: https://stackoverflow.com/questions/28282295/getbbox-of-svg-when-hidden
  const svgClone = svg.cloneNode(true) as SVGGraphicsElement;
  const div = document.createElement('div', {});
  div.setAttribute('style', 'position: absolute; visibility: hidden; width: 0; height: 0');
  div.appendChild(svgClone);

  document.body.appendChild(div);

  const bbBox = svgClone.getBBox();

  document.body.removeChild(div);

  return bbBox;
};

const svgInner = defineAsyncComponent(async () => {
  const svgText = await import(`../../assets/map-objects-symbols/${props.iconName}.svg`)

  if (svgText != null) {
    const range = document.createRange();
    const svgFragment = range.createContextualFragment(svgText);

    // Trim the space around the actual icon!
    const firstEl = svgFragment.firstChild! as Element;
    const svgBoundingBox = horribleSvgGetBBox(firstEl as SVGGraphicsElement);
    firstEl.setAttribute('viewBox', `${svgBoundingBox.x} ${svgBoundingBox.y} ${svgBoundingBox.width} ${svgBoundingBox.height}`);

    const svgAttributes = Object.fromEntries(Array.from(firstEl.attributes).map(v => [v.name, v.value]))

    const cssClass = normalizeClass([attributes.class, svgAttributes.class]);
    const style = normalizeStyle([attributes.style, svgAttributes.style]);

    return h('svg', {...attributes, ...svgAttributes, class: cssClass, style: style, innerHTML: firstEl.innerHTML});
  } else {
    return h('span');
  }
});
</script>

<style scoped>
</style>
