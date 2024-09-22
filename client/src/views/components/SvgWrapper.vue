<template>
  <object type="image/svg+xml" :data="href" v-on:load="onload($event)" />
</template>

<script>
export default {
  props: {
    href: null
  },
  methods: {
    onload: function (e) {
      // Based on information from here: https://stackoverflow.com/questions/22252409/manipulating-external-svg-file-style-properties-with-css/72804140#72804140
      // Basically we elevate our SVG out of the shadow DOM to the DOM, so that it can then be affected by our CSS classes!

      // Carry over our existing CSS classes to the SVG.
      e.target.contentDocument.documentElement.classList.add(...e.target.classList);

      // Copy the data- attributes so the CSS classes will work, etc.
      for (let attribute of e.target.attributes) {
        if (attribute.name.startsWith('data-')) {
          e.target.contentDocument.documentElement.setAttribute(attribute.name, attribute.value);
        }
      }

      // Trim the space around the actual icon!
      let svgBoundingBox = this.horribleSvgGetBBox(e.target.contentDocument.documentElement);
      e.target.contentDocument.documentElement.setAttribute('viewBox', `${svgBoundingBox.x} ${svgBoundingBox.y} ${svgBoundingBox.width} ${svgBoundingBox.height}`);

      // Elevate the SVG element at last!
      e.target.parentNode.replaceChild(e.target.contentDocument.documentElement, e.target);
    },
    horribleSvgGetBBox(svg) {
      // This abomination is needed because getBBox() returns all zeroes if the SVG isn't currently "visible".
      // Based on the answers from here: https://stackoverflow.com/questions/28282295/getbbox-of-svg-when-hidden
      let svgClone = svg.cloneNode(true);
      let div = document.createElement('div', {});
      div.setAttribute('style', 'position: absolute; visibility: hidden; width: 0; height: 0');
      div.appendChild(svgClone);

      document.body.appendChild(div);

      let bbBox = svgClone.getBBox();

      document.body.removeChild(div);

      return bbBox;
    }
  }
}
</script>

<style scoped>
</style>
