<template>
<div>
    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2 mb-2">Select a race and an alias for your commander.</p>
        </div>
    </div>

    <div class="row bg-secondary">
        <div class="col">
            <form @submit.prevent>
                <div class="row">
                  <div class="col-auto bg-primary">
                    <select-avatar v-on:onAvatarChanged="onAvatarChanged"/>
                  </div>
                  <div class="col pt-3">
                    <p v-if="!avatar">Every great story needs both heroes and villians. Which will you be?</p>

                    <h5 v-if="avatar">{{avatar.name}}</h5>
                    <p v-if="avatar"><small class="linebreaks">{{avatar.description}}</small></p>

                    <div class="form-group">
                      <input name="alias" class="form-control" required="required" placeholder="Enter your alias here" type="text" minlength="3" maxlength="24" v-model="alias" v-on:keyup="onAliasChanged">
                    </div>

                    <!-- <div class="form-group text-center small">
                        <p>Your alias must be between 3 and 24 characters.</p>
                    </div> -->
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
  data () {
    return {
      alias: null,
      avatar: null
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
