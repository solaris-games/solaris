<template>
    <div class="pt-1 pb-2 row">
      <div class="col text-center">
        <small>
          <a class="text-danger" href="javascript:;" @click="onOpenReportPlayerRequested">Report this player</a>
        </small>
      </div>
    </div>
</template>

<script>
export default {
    props: {
        playerId: String
    },
    methods: {
        onOpenReportPlayerRequested (e) {
            this.$emit('onOpenReportPlayerRequested', {
              playerId: this.playerId
            })
        }
    }
}
</script>

<style scoped>
</style>
