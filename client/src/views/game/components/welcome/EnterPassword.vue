<template>
<div>
    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2 mb-2">Enter the game password to continue.</p>
        </div>
    </div>

    <div class="row bg-secondary">
        <div class="col">
            <form @submit.prevent>
                <div class="form-group mt-3">
                    <input class="form-control" required="required" placeholder="Password" type="password" v-model="password" v-on:keyup="onPasswordChanged">
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      password: null
    }
  },
  methods: {
    onPasswordChanged (e) {
      this.$emit('onPasswordChanged', this.password)
    }
  }
}
</script>

<style scoped>
</style>
