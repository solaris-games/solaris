<template>
  <div v-if="displayPoll" class="alert alert-success fade show poll">
    <span>Please participate in the 2024 <a class="alert-link" target="_blank" href="https://docs.google.com/forms/d/1HjfAphQ9EG8rRla_ipTIJAudbGZEoOwinCdqTkHcYb8">Solaris Community Poll!</a></span>
    <button type="button" class="btn btn-secondary btn-sm" @click="dismissPoll" aria-label="Close">Do not ask again</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      displayPoll: false
    }
  },
  mounted () {
    this.loadState();
  },
  methods: {
    loadState () {
      const item = localStorage.getItem('solaris-poll-2024');
      this.displayPoll = !item || item !== 'dismissed'
    },
    saveState () {
      if (!this.displayPoll) {
        localStorage.setItem('solaris-poll-2024', 'dismissed')
      }
    },
    async dismissPoll () {
      this.displayPoll = false
      this.saveState()
    }
  }
}
</script>

<style scoped>
.poll {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
