<template>
<div>
    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2">Select a name for your commander in chief.</p>
            <p class="mb-2">(Step 2 of 3)</p>
        </div>
    </div>

    <div class="row bg-light">
        <div class="col">
            <form @submit.prevent>
                <div class="form-group mt-2 text-center">
                    <p class="mb-0">Choose a new alias every game and play anonymously.</p>
                    <p>Every great story needs both heroes and villians. Which will you be?</p>
                </div>

                <div class="form-group">
                    <input class="form-control" required="required" placeholder="Enter your alias here" type="text" v-model="alias" v-on:keyup="onAliasChanged">
                </div>

                <div class="form-group text-center small">
                    <p>Your alias must be between 3 and 24 characters and can only contain standard characters.</p>
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
      alias: ''
    }
  },
  methods: {
    onAliasChanged (e) {
      this.$emit('onAliasChanged', this.alias)
    }
  }
}
</script>

<style scoped>
</style>
