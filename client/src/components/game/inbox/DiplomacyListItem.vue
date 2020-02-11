<template>
<div class="container bg-primary pt-2 pb-1 mb-2">
    <p class="float-right"><small>Sun 1 Jan 01:01</small></p>
    <div class="row">
        <div class="col-2 pl-0 pr-0">
            <img src="../../../assets/avatars/0.jpg" width="60"/>
        </div>
        <!-- <div class="col-2 pl-1 pr-0">
            From:<br/>
            To:
        </div> -->
        <div class="col pl-2 pr-2">
            <i class="fas fa-user-circle"></i> Some alias<br/>
            <i class="far fa-user-circle"></i> Some alias

            <p class="mt-2">Some message</p>
        </div>
    </div>
</div>
</template>

<script>
export default {
  components: {
  },
  props: {
    game: Object
  }
}
</script>

<style scoped>
</style>