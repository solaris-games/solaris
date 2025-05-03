<template>
  <div class="full-container">
    <view-container :hideTopBar="true">
      <view-title title="Create Account" navigation="home"/>

      <div class="row">
        <div class="col-sm-12 col-md-6">
          <h4>Sign up to play <span class="text-warning">Solaris</span>!</h4>
          <p>Discover a space strategy game filled with conquest, betrayal and subterfuge.</p>
          <p>Build alliances, make enemies and fight your way to victory to <span class="text-danger">galactic domination.</span>
          </p>
          <p><span class="text-info">Research and improve technologies</span> to gain an edge over your opponents. Trade
            with allies and build up huge fleets of ships.</p>
          <p>Will you conquer the galaxy?</p>
          <hr/>
          <p>You can play <span class="text-warning">Solaris</span> on any of the following platforms:</p>
          <p>
            <a href="https://solaris.games" target="_blank" title="Web" class="me-2">
              <i class="fab fa-chrome"></i> Web
            </a>
            <a href="https://store.steampowered.com/app/1623930/Solaris/" target="_blank" title="Steam" class="me-2">
              <i class="fab fa-steam"></i> Steam
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.voxel.solaris_android" target="_blank"
               title="Android">
              <i class="fab fa-google-play"></i> Android
            </a>
          </p>
        </div>
        <div class="col-sm-12 col-md-6">
          <form-error-list v-bind:errors="errors"/>

          <form @submit="handleSubmit">
            <div class="mb-2">
              <label for="email">Email Address</label>
              <input type="email" required="required" class="form-control" name="email" v-model="email"
                     :disabled="isLoading">
            </div>

            <div class="mb-2">
              <label for="username">Username</label>
              <input type="text" required="required" class="form-control" name="username" minlength="3" maxlength="24"
                     v-model="username" :disabled="isLoading">
            </div>

            <div class="mb-2">
              <label for="password">Password</label>
              <input type="password" required="required" class="form-control" name="password" v-model="password"
                     :disabled="isLoading">
            </div>

            <div class="mb-2">
              <label for="passwordConfirm">Re-enter Password</label>
              <input type="password" required="required" class="form-control" name="passwordConfirm"
                     v-model="passwordConfirm" :disabled="isLoading">
            </div>

            <div class="checkbox mb-2">
              <input id="privacyPolicy" type="checkbox" required="required" name="privacyPolicy"
                     v-model="privacyPolicyAccepted" :disabled="isLoading" class="me-2">
              <label for="privacyPolicy">Accept
                <router-link :to="{ name: 'privacy-policy'}" class="me-2" title="Privacy Policy">
                  Privacy Policy
                </router-link>
              </label>
            </div>

            <div class="mb-2">
              <div class="row">
                <div class="col-6">
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-success" :disabled="isLoading">
                      <i class="fas fa-sign-in-alt"></i>
                      Register
                    </button>
                  </div>
                </div>
                <div class="col-6">
                  <div class="d-grid gap-2">
                    <router-link to="/" tag="button" class="btn btn-outline-danger">Cancel</router-link>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <loading-spinner :loading="isLoading"/>
        </div>
      </div>
    </view-container>

    <parallax/>
  </div>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import router from '../../router'
import ViewTitle from '../components/ViewTitle.vue'
import FormErrorList from '../components/FormErrorList.vue'
import userService from '../../services/api/user'
import ParallaxVue from '../components/Parallax.vue'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'form-error-list': FormErrorList,
    'parallax': ParallaxVue
  },
  data() {
    return {
      isLoading: false,
      errors: [],
      email: null,
      username: null,
      password: null,
      passwordConfirm: null,
      privacyPolicyAccepted: false
    }
  },
  methods: {
    async handleSubmit(e) {
      this.errors = []

      if (!this.email) {
        this.errors.push('Email required.')
      }

      if (!this.username) {
        this.errors.push('Username required.')
      }

      if (!this.password) {
        this.errors.push('Password required.')
      }

      if (!this.passwordConfirm) {
        this.errors.push('Password confirmation required.')
      }

      if (this.password !== this.passwordConfirm) {
        this.errors.push('Passwords must match.')
      }

      if (!this.privacyPolicyAccepted) {
        this.errors.push('Privacy policy must be accepted.')
      }

      e.preventDefault()

      if (this.errors.length) return

      try {
        this.isLoading = true

        // Call the account create API endpoint
        const response = await userService.createUser(this.email, this.username, this.password)

        if (response.status === 201) {
          this.$toast.success(`Welcome ${this.username}! You can now log in and play Solaris.`)

          router.push({name: 'home'})
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped>
img {
  object-fit: cover;
}

.full-container {
  background-color: black !important;
}
</style>
