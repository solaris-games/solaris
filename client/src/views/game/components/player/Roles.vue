<template>
  <div>
    <div class="row bg-success mb-2" v-if="user && user.roles.contributor">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          <span v-if="displayText">This player is a</span> Contributor <i class="fas fa-hands-helping"></i>
        </p>
      </div>
    </div>

    <div class="row bg-warning mb-2" v-if="user && user.roles.developer">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          <span v-if="displayText">This player is an active</span> Developer <i class="fas fa-code"></i>
        </p>
      </div>
    </div>

    <div class="row bg-info mb-2" v-if="user && user.roles.communityManager">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          <span v-if="displayText">This player is an active</span> Community Manager <i class="fas fa-user-friends"></i>
        </p>
      </div>
    </div>

    <div class="row bg-info mb-2" v-if="user && user.roles.gameMaster">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          <span v-if="displayText">This player is an active</span> Game Master <i class="fas fa-dice"></i>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
    displayText: Boolean
  }
}
</script>
