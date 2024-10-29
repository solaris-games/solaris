<template>
  <div class="menu-page container">
    <menu-title :title="menuTitle" @onCloseRequested="onCloseRequested"/>

    <p class="mb-1">
      Choose a reason why you are reporting <a href="javascript:;"
                                               @click="onOpenPlayerDetailRequested">{{ player.alias }}</a>.
    </p>

    <p class="mb-2">
      <small>
        If the reason is not listed, please contact a developer or community manager on
        <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord">
          <i class="fab fa-discord"></i>
          <span class="ms-1">Discord</span>
        </a>
      </small>
    </p>

    <form @submit.prevent>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionAbuse" id="chkAbuse">
        <label class="form-check-label" for="chkAbuse">
          Verbal Abuse
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionSpamming" id="chkSpamming">
        <label class="form-check-label" for="chkSpamming">
          Spamming
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionMultiboxing" id="chkMultiboxing">
        <label class="form-check-label" for="chkMultiboxing">
          Multiboxing
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" v-model="optionInappropriateAlias" id="chkInappropriateAlias">
        <label class="form-check-label" for="chkInappropriateAlias">
          Inappropriate Alias
        </label>
      </div>

      <p class="text-danger mb-1 mt-2">
        <small>WARNING: Abuse of the report feature may lead to your account being banned.</small>
      </p>

      <div class="text-end pt-2 pb-2">
        <button class="btn btn-danger me-1" type="button" @click="onOpenPlayerDetailRequested">
          <i class="fas fa-arrow-left"></i>
          Cancel
        </button>
        <button class="btn btn-warning" type="button" @click="confirmReportPlayer"
                :disabled="!optionAbuse && !optionSpamming && !optionMultiboxing && !optionInappropriateAlias">
          <i class="fas fa-flag"></i>
          Report
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import GameHelper from '../../../../services/gameHelper'
import ReportApiService from '../../../../services/api/report'

export default {
  components: {
    'menu-title': MenuTitle
  },
  props: {
    args: Object,
  },
  data() {
    return {
      optionAbuse: false,
      optionSpamming: false,
      optionMultiboxing: false,
      optionInappropriateAlias: false
    }
  },
  methods: {
    onCloseRequested(e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested(e) {
      this.$emit('onOpenPlayerDetailRequested', this.args.playerId)
    },
    async confirmReportPlayer() {
      if (!await this.$confirm(this.menuTitle, `Are you sure you want to report ${this.player.alias}?`)) {
        return
      }

      try {
        await ReportApiService.reportPlayer(this.$store.state.game._id, this.args.playerId, this.args.messageId, this.args.conversationId, this.optionAbuse, this.optionSpamming, this.optionMultiboxing, this.optionInappropriateAlias)

        this.$toast.success(`You have reported ${this.player.alias}. We will investigate and take action if necessary.`)

        this.onOpenPlayerDetailRequested()
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    player() {
      return GameHelper.getPlayerById(this.$store.state.game, this.args.playerId)
    }
    ,
    menuTitle() {
      if (this.args.messageId) {
        return 'Report Message'
      } else {
        return 'Report Player'
      }
    }
  }
}
</script>

<style scoped>
</style>
