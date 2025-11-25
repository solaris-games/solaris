<template>
  <view-container :is-auth-page="true">
    <view-title title="Create Guild" />

    <loading-spinner :loading="isLoading"/>

    <h4>Found a new guild</h4>

    <ul>
      <li>Become the <strong>leader</strong> of a prestigious guild.</li>
      <li>Invite your friends and allies to join you.</li>
      <li>Show off your guild tag in games.</li>
      <li>Assign roles to <strong>Members</strong>, promote players to <strong class="text-info">Officers</strong>.</li>
      <li>Arrange <strong class="text-warning">Guild vs. Guild</strong> matches to see which guild is best.</li>
    </ul>

    <form @submit="handleSubmit">
      <div class="mb-2">
        <label for="name">Guild Name</label>
        <input type="text" required="required" class="form-control" minlength="4" maxlength="64" name="name" v-model="name" :disabled="isLoading"
          @change="onGuildNameChanged">
      </div>

      <div class="mb-2">
        <label for="tag">Guild Tag</label>
        <input type="text" required="required" class="form-control" minlength="2" maxlength="4" name="tag" v-model="tag" :disabled="isLoading">
      </div>

      <form-error-list :errors="errors"/>

      <p><span class="text-warning">Warning</span>: Founding a guild costs <strong class="text-danger">3 Galactic Credits</strong>. <router-link :to="{ name: 'galactic-credits-shop'}"><i class="fas fa-shopping-basket"></i> Purchase Galactic Credits</router-link> or earn credits by winning official games.</p>

      <div class="mb-2">
        <div class="row">
          <div class="col">
            <router-link to="/guild" tag="button" class="btn btn-danger">
              <i class="fas fa-arrow-left"></i>
              Cancel
            </router-link>
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-success" :disabled="isLoading">
              <i class="fas fa-shield-alt"></i>
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
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
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

      if (!await this.$confirm('Found guild', `Are you sure you want to found a guild? It will cost 3 galactic credits.`)) {
        return
      }

      try {
        this.isLoading = true

        // Call the account create API endpoint
        let response = await GuildApiService.create(this.name, this.tag)

        if (response.status === 201) {
          this.$toast.success(`You have founded the guild ${this.name} [${this.tag}]!`)

          router.push({ name: 'guild' })
        }
      } catch (err) {
        console.log(err)
        this.errors = err.response.data.errors || []
      }

      this.isLoading = false
    },
    onGuildNameChanged (e) {
      this.name = this.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
  }
}
</script>

<style scoped>

</style>
