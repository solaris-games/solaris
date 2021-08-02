<template>
<div class="img-container pt-3 pb-3 pl-3 pr-3 container">
    <div class="row">
        <div class="col-sm-12 col-md-6 col-lg-4 offset-md-3 offset-lg-4">
            <img @click="goHome" :src="require('../assets/solaris_logo_text_1000w.png')">
        </div>
    </div>
</div>
</template>

<script>
import router from '../router'

export default {
  methods: {
    goHome () {
      router.push({name: 'home'})
    }
  }
}
</script>

<style scoped>
img {
  display:block;
  margin:auto;
  max-width:100%;
  max-height:100%;
  cursor: pointer;
}
</style>
