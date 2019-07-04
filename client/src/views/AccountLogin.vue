<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col col-md-6 col-lg-5 bg-light">
        <view-title title="Login" navigation="home"/>

        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <input type="text" required="required" class="form-control" placeholder="Username" v-model="username" />
            </div>

            <div class="form-group">
                <input type="password" required="required" class="form-control" placeholder="Password" v-model="password" />
            </div>

            <form-error-list v-bind:errors="errors"/>
        
            <div class="form-group">
                <router-link to="/" tag="button" type="button" class="btn btn-danger">Cancel</router-link>
                <input type="submit" class="btn btn-success ml-1" value="Login" />
            </div>

            <div class="form-group">
                <router-link to="/account/forgot-password">Forgot Password?</router-link>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import router from "../router";
import ViewTitle from "../components/ViewTitle";
import FormErrorList from "../components/FormErrorList";
import apiService from '../services/apiService';

export default {
  components: {
    "view-title": ViewTitle,
    "form-error-list": FormErrorList
  },
  data() {
    return {
      errors: [],
      username: 't',//null,
      password: 't'//null
    };
  },
  mounted() { this.handleSubmit(null); },
  methods: {
    async handleSubmit(e) {
      this.errors = [];

      if (!this.username) {
        this.errors.push("Username required.");
      }

      if (!this.password) {
        this.errors.push("Password required.");
      }

      e && e.preventDefault();

      if (this.errors.length) return;

      try {
        // Call the login API endpoint
        let response = await apiService.login(this.username, this.password);

        if (response.status === 200) {
          this.$store.commit('setUserId', response.data.id);

          router.push({ name: "main-menu" });
        }
      } catch(err) {
        this.errors = err.response.data.errors || [];
      }
    }
  }
};
</script>

<style scoped>
</style>
