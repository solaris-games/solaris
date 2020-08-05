<template>
<div>
    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2 mb-2">Select a name for your commander in chief.</p>
        </div>
    </div>

    <div class="row bg-secondary">
        <div class="col">
            <form @submit.prevent>
                <div class="form-group mt-2 text-center">
                    <p class="mb-0">Choose a new alias every game and play anonymously.</p>
                    <p>Every great story needs both heroes and villians. Which will you be?</p>
                </div>

                <div class="form-group">
                    <input class="form-control" required="required" placeholder="Enter your alias here" type="text" minlength="3" maxlength="24" v-model="alias" v-on:keyup="onAliasChanged">
                </div>

                <div class="form-group text-center small">
                    <p>Your alias must be between 3 and 24 characters.</p>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import UserService from '../../../services/api/user'

export default {
  data () {
    return {
      alias: null
    }
  },
  async mounted () {
    try {
      let response = await UserService.getMyUserInfo()

      if (response.status === 200) {
        this.alias = response.data.username
        this.onAliasChanged(this.alias)
      }
    } catch (err) {
      console.error(err)
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
