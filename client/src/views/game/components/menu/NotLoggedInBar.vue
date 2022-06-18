<template>
<div class="bg-danger container">
    <div class="row pt-2 pb-2">
        <div class="col d-none d-sm-block">
            <p class="mt-1 mb-0">You are not logged in.</p>
        </div>
        <div class="col-sm-auto col-xs-12 text-center">
            <router-link to="/" class="btn btn-sm"><i class="fas fa-sign-in-alt me-2"></i>Log In</router-link>
            <router-link to="/account/create" class="btn btn-sm"><i class="fas fa-user-plus me-2"></i>Register</router-link>
        </div>
    </div>
</div>
</template>

<script>
export default {
  
}
</script>

<style scoped>
</style>
