<script>
import { h } from 'vue'

let svgCacheMap = new Map();

const horribleSvgGetBBox = (svg) => {
  // This abomination is needed because getBBox() returns all zeroes if the SVG isn't currently "visible".
  // Based on the answers from here: https://stackoverflow.com/questions/28282295/getbbox-of-svg-when-hidden
  let svgClone = svg.cloneNode(true);
  let div = document.createElement('div', {});
  div.setAttribute('style', 'position: absolute; visibility: hidden; width: 0; height: 0');
  div.appendChild(svgClone);

  document.body.appendChild(div);

  console.warn(svgClone);

  let bbBox = svgClone.getBBox();

  document.body.removeChild(div);

  return bbBox;
}

export default {
  props: {
    href: null
  },
  async setup(props) {
    let svgText = null;
    console.warn(props.href);


    if (svgCacheMap.has(props.href)) {
      svgText = svgCacheMap.get(props.href);
    }
    else {

      let svgResponse = await fetch(props.href);

      if (svgResponse.ok) {
        svgText = await svgResponse.text();
        svgCacheMap.set(props.href, svgText);
      }
    }

    if (svgText != null) {
      let range = document.createRange();
      let svgFragment = range.createContextualFragment(svgText);

      console.warn(svgFragment.firstChild);

      // Trim the space around the actual icon!
      let svgBoundingBox = horribleSvgGetBBox(svgFragment.firstChild);
      svgFragment.firstChild.setAttribute('viewBox', `${svgBoundingBox.x} ${svgBoundingBox.y} ${svgBoundingBox.width} ${svgBoundingBox.height}`);

      const attrs = Object.fromEntries(Array.from(svgFragment.firstChild.attributes).map(v => [v.name, v.value]));

      return () => h('svg', { innerHTML: svgFragment.firstChild.innerHTML , ...attrs});
    }
    else {
      return () => h('span');
    }
  }
}

</script>

<style scoped>
</style>
