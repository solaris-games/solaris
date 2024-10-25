<script>
import { h } from 'vue'

let svgCacheMap = new Map();

export default {
  props: {
    href: null
  },
  render() {
    return h(this.renderInternal);
  },
  methods: {
    async renderInternal() {
      let svgText = null;

      if (svgCacheMap.has(this.href)) {
        svgText = svgCacheMap.get(this.href);
      }
      else {
        let svgResponse = await fetch(this.href);

        if (svgResponse.ok) {
          svgText = await svgResponse.text();
          svgCacheMap.set(this.href, svgText);
        }
      }

      if (svgText != null) {
        let range = document.createRange();
        let svgFragment = range.createContextualFragment(svgText);

        // Trim the space around the actual icon!
        let svgBoundingBox = this.horribleSvgGetBBox(svgFragment.firstChild);
        svgFragment.firstChild.setAttribute('viewBox', `${svgBoundingBox.x} ${svgBoundingBox.y} ${svgBoundingBox.width} ${svgBoundingBox.height}`);

        return { render: (h) => h('svg', { attrs: Object.fromEntries(Array.from(svgFragment.firstChild.attributes).map(v => [v.name, v.value])), domProps: { innerHTML: svgFragment.firstChild.innerHTML } }) };
      }
      else {
        return { render: (h) => h('span') };
      }
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
