<template>
  <div>
    <loading-spinner :loading="isLoading"/>

    <h5>Invite Player</h5>

    <form-error-list :errors="errors"/>

    <form @submit="handleSubmit">
        <div class="row g-0">
            <div class="col">
                <input type="text" required="required" class="form-control" name="username" v-model="username" :disabled="isLoading" placeholder="Enter Player Name..." minlength="3" maxlength="24">
            </div>
            <div class="col-auto ms-2">
                <button type="submit" class="btn btn-success" :disabled="isLoading">
                    <i class="fas fa-user-plus"></i>
                    Invite
                </button>
            </div>
        </div>
    </form>
  </div>
</template>

<script>
import FormErrorList from '../../components/FormErrorList.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import GuildApiService from '../../../services/api/guild'

export default {
  components: {
    'form-error-list': FormErrorList,
    'loading-spinner': LoadingSpinner
  },
  props: {
      guildId: String
  },
  data () {
    return {
      isLoading: false,
      errors: [],
      username: ''
    }
  },
  methods: {
    async handleSubmit (e) {
      this.errors = []

      if (!this.username) {
        this.errors.push('Username is required.')
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        this.isLoading = true

        let response = await GuildApiService.invite(this.guildId, this.username)

        if (response.status === 200) {
          this.$toast.default(`You invited ${this.username} to the guild.`, { type: 'success' })

          this.$emit('onUserInvited', response.data)

          this.username = ''
        }
      } catch (err) {
        console.log(err)
        this.errors = err.response.data.errors || []
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped>

</style>
