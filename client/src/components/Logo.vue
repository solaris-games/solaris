<template>
<div class="img-container pt-3 pb-3 pl-3 pr-3 container">
    <div class="row">
        <div class="col-sm-12 col-md-6 col-lg-4 offset-md-3 offset-lg-4">
            <img :src="require('../assets/solaris_logo_text_1000w.png')">
        </div>
    </div>
</div>
</template>

<script>
export default {
  props: {

  }
}
</script>

<style scoped>
img {
  display:block;
  margin:auto;
  max-width:100%;
  max-height:100%;
}
</style>
