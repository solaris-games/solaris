<template>
  <view-container>
    <view-title title="Create Guild" />

    <loading-spinner :loading="isLoading"/>

    <p>Found a new guild.</p>

    <form @submit="handleSubmit">
      <div class="form-group">
        <label for="name">Guild Name</label>
        <input type="text" required="required" class="form-control" minlength="4" maxlength="100" name="name" v-model="name" :disabled="isLoading">
      </div>

      <div class="form-group">
        <label for="tag">Guild Tag</label>
        <input type="text" required="required" class="form-control" minlength="2" maxlength="4" name="tag" v-model="tag" :disabled="isLoading">
      </div>

      <form-error-list :errors="errors"/>
      
      <div class="form-group">
        <div class="row">
          <div class="col-6">
            <button type="submit" class="btn btn-success btn-block" :disabled="isLoading">
              <i class="fas fa-users"></i>
              Found Guild
            </button>
          </div>
          <div class="col-6">
            <router-link to="/" tag="button" class="btn btn-danger btn-block">Cancel</router-link>
          </div>
        </div>
      </div>
    </form>
  </view-container>
</template>

<script>
import router from '../../router'
import ViewContainer from '../../components/ViewContainer'
import ViewTitle from '../../components/ViewTitle'
import FormErrorList from '../../components/FormErrorList'
import LoadingSpinner from '../../components/LoadingSpinner'
import GuildApiService from '../../services/api/guild'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'form-error-list': FormErrorList,
    'loading-spinner': LoadingSpinner
  },
  data () {
    return {
      isLoading: false,
      errors: [],
      name: '',
      tag: ''
    }
  },
  methods: {
    async handleSubmit (e) {
      this.errors = []

      if (!this.name) {
        this.errors.push('Name is required.')
      }

      if (!this.tag) {
        this.errors.push('Tag is required.')
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        this.isLoading = true

        // Call the account create API endpoint
        let response = await GuildApiService.create(this.name, this.tag)

        if (response.status === 201) {
          this.$toasted.show(`You have founded the guild ${this.name} [${this.tag}]!`, { type: 'success' })

          router.push({ name: 'guild', params: { guildId: response.data._id } })
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
