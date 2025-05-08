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
                      <input name="alias" class="form-control" required="required" placeholder="Enter your alias here" type="text" minlength="1" maxlength="24" v-model="alias" @change="onAliasChanged">
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
import { inject } from 'vue';
import SelectAvatar from './SelectAvatar.vue'
import { httpInjectionKey, isOk } from '@/services/typedapi';
import { detailMe } from '@/services/typedapi/user';

export default {
  components: {
    'select-avatar': SelectAvatar
  },
  props: {
    isAnonymousGame: Boolean,
  },
  setup () {
    return {
      httpClient: inject(httpInjectionKey),
    };
  },
  data () {
    return {
      alias: null,
      avatar: null,
    }
  },
  async mounted () {
    try {
      const response = await detailMe(this.httpClient)();

      if (isOk(response)) {
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
