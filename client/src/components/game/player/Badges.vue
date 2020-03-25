<template>
<div>
    <div class="row bg-primary">
        <div v-if="!user.badges" class="col text-center pt-3">
            <p class="mb-3">No badges yet!</p>
        </div>
    </div>

    <div class="row">
        <div class="col text-center pt-2">
            <p class="mb-2">Buy this player a <router-link to="/todo">Badge of Honor</router-link> or <router-link to="/todo">Premium Membership</router-link>!</p>
        </div>
    </div>
</div>
</template>

<script>
export default {
  props: {
    user: Object
  }
}
</script>

<style scoped>
</style>
