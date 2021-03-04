<template>
  <view-container>
    <view-title title="Create Guild" />

    <loading-spinner :loading="isLoading"/>

    <h4>Found a new guild</h4>
    
    <ul>
      <li>Become the leader of a prestigeous guild.</li>
      <li>Invite your friends and allies to join you.</li>
      <li>Show off your guild tag in games.</li>
      <li>Assign roles to Members, promote players to Officers.</li>
      <li>Arrange Guild vs. Guild matches to see which guild is best.</li>
    </ul>

    <form @submit="handleSubmit">
      <div class="form-group">
        <label for="name">Guild Name</label>
        <input type="text" required="required" class="form-control" minlength="4" maxlength="31" name="name" v-model="name" :disabled="isLoading">
      </div>

      <div class="form-group">
        <label for="tag">Guild Tag</label>
        <input type="text" required="required" class="form-control" minlength="2" maxlength="4" name="tag" v-model="tag" :disabled="isLoading">
      </div>

      <form-error-list :errors="errors"/>

      <p>Founding a guild costs <strong class="text-warning">3 galactic credits</strong>. Earn credits by winning official games.</p>
      
      <div class="form-group">
        <div class="row">
          <div class="col">
            <router-link to="/guild" tag="button" class="btn btn-danger">
              <i class="fas fa-arrow-left"></i>
              Cancel
            </router-link>
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-success" :disabled="isLoading">
              <i class="fas fa-users"></i>
              Found Guild
            </button>
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

      if (!confirm(`Are you sure you want to found a guild? It will cost 3 galactic credits.`)) {
        return
      }

      try {
        this.isLoading = true

        // Call the account create API endpoint
        let response = await GuildApiService.create(this.name, this.tag)

        if (response.status === 201) {
          this.$toasted.show(`You have founded the guild ${this.name} [${this.tag}]!`, { type: 'success' })

          router.push({ name: 'guild' })
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
