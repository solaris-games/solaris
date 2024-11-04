<template>
<div>
    <div class="row text-center bg-primary mb-2">
        <div class="col">
            <p class="mb-0 mt-2 mb-2">Select a race and an alias for your commander.</p>
        </div>
    </div>

    <div class="row bg-dark p-2">
        <div class="col">
            <form @submit.prevent>
                <div class="row">
                  <div class="col-auto bg-dark">
                    <select-avatar v-on:onAvatarChanged="onAvatarChanged"/>
                  </div>
                  <div class="col pt-0">
                    <p v-if="!avatar">Every great story needs both heroes and villains. Which will you be?</p>

                    <h5 v-if="avatar">{{avatar.name}}</h5>
                    <p v-if="avatar"><small class="linebreaks">{{avatar.description}}</small></p>

                    <div class="mb-2">
                      <input name="alias" class="form-control" required="required" placeholder="Enter your alias here" type="text" minlength="3" maxlength="24" v-model="alias" @change="onAliasChanged">
                    </div>

                    <div v-if="isAnonymousGame" class="alert alert-warning">
                      <p>This game is anonymous, you might want to hide your identity!</p>
                    </div>
                  </div>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import UserService from '../../../../services/api/user'
import SelectAvatarVue from './SelectAvatar.vue'

export default {
  components: {
    'select-avatar': SelectAvatarVue
  },
  props: {
    isAnonymousGame: Boolean,
  },
  data () {
    return {
      alias: null,
      avatar: null,
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
    },
    onAvatarChanged (e) {
      this.avatar = e

      this.$emit('onAvatarChanged', e)
    }
  }
}
</script>

<style scoped>
.linebreaks {
  white-space: break-spaces;
}
</style>
