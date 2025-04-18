<template>
<div>
    <div class="row avatar-container text-center">
        <img v-if="avatar != null" :src="getAvatarImage()" width="128" height="128">
        <p v-if="avatar == null" class="select-avatar-warning text-warning">Select an avatar</p>
        <p v-if="avatar && !avatar.purchased" class="select-avatar-locked"><i class="fas fa-lock"></i></p>
    </div>

    <div class="row mt-1 mb-1">
      <div class="col pe-0 ps-0">
        <button class="btn btn-primary" @click="prevAvatar()"><i class="fas fa-chevron-left"></i></button>
      </div>
      <div class="col-auto pe-0 ps-0">
        <button class="btn btn-primary" @click="nextAvatar()"><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>

    <div class="row">
      <div class="col-12 pe-0 ps-0 mt-1 mb-1">
        <div class="d-grid gap-2">
          <router-link :to="{ name: 'avatars'}" class="btn btn-sm btn-success">
            <i class="fas fa-shopping-cart"></i> Shop
          </router-link>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import UserApiService from '../../../../services/api/user'

export default {
  data () {
    return {
      isLoading: false,
      avatar: null,
      avatars: []
    }
  },
  async mounted () {
    await this.reloadAvatars()
  },
  methods: {
    onAvatarChanged (e) {
      this.$emit('onAvatarChanged', this.avatar)
    },
    async reloadAvatars () {
      this.isLoading = true

      try {
        let response = await UserApiService.getUserAvatars()

        if (response.status === 200) {
          this.avatars = response.data
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    nextAvatar (e) {
      if (this.avatar == null) {
        this.avatar = this.avatars.find(a => a.id === 21)
      } else {
        let currentIndex = this.avatars.indexOf(this.avatar)

        currentIndex++

        if (currentIndex > this.avatars.length - 1) {
            currentIndex = 0
        }

        this.avatar = this.avatars[currentIndex]
      }

      this.onAvatarChanged(this.avatar)
    },
    prevAvatar (e) {
      if (this.avatar == null) {
        this.avatar = this.avatars.find(a => a.id === 21)
      } else {
        let currentIndex = this.avatars.indexOf(this.avatar)

        currentIndex--

        if (currentIndex < 0) {
            currentIndex = this.avatars.length - 1
        }

        this.avatar = this.avatars[currentIndex]
      }

      this.onAvatarChanged(this.avatar)
    },
    getAvatarImage () {
      try {
        return new URL(`../../../../assets/avatars/${this.avatar.file}`, import.meta.url).href
      } catch (err) {
        console.error(err)

        return null
      }
    }
  }
}
</script>

<style scoped>
.avatar-container {
  width: 128px;
  height: 128px;
}

.select-avatar-warning {
  display: table-cell;
  width: 128px;
  height: 128px;
  padding: 20px 0px;
  border: 3px dashed #fff;
  vertical-align: middle;
}

.select-avatar-locked {
  display: table-cell;
  width: 128px;
  height: 128px;
  padding: 20px 0px;
  vertical-align: middle;
  position: absolute;
  font-size: 55px;
  opacity: 0.75;
}
</style>
