<template>
<div>
    <div class="row avatar-container text-center">
        <img v-if="avatar != null" :src="getAvatarImage()" width="128" height="128">
        <p v-if="avatar == null" class="text-warning">Select an avatar</p>
    </div>

    <div class="row bg-primary">
        <div class="col pr-0 pl-0">
            <button class="btn btn-primary" @click="prevAvatar()"><i class="fas fa-chevron-left"></i></button>
        </div>
        <div class="col-auto pr-0 pl-0">
            <button class="btn btn-primary ml-1" @click="nextAvatar()"><i class="fas fa-chevron-right"></i></button>
        </div>
    </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      avatar: null,
      avatars: []
    }
  },
  mounted () {
    // TODO: This should be dynamic.
    for (let i = 0; i < 42; i++) {
        this.avatars.push(i.toString())
    }
  },
  methods: {
    onAvatarChanged (e) {
      this.$emit('onAvatarChanged', this.avatar)
    },
    nextAvatar (e) {
      if (this.avatar == null) {
        this.avatar = '22'
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
        this.avatar = '22'
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
      return require('../../../assets/avatars/' + this.avatar + '.png')
    }
  }
}
</script>

<style scoped>
.avatar-container {
  width: 128px;
  height: 128px;
}

p {
  display: table-cell;
  width: 128px;
  height: 128px;
  padding: 20px 0px;
  border: 3px dashed #fff;
  vertical-align: middle;
}
</style>
