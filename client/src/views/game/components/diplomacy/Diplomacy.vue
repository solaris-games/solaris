<template>
<div class="menu-page container">
    <menu-title title="Diplomacy" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoading"/>

    <p v-if="!isFormalAlliancesEnabled" class="pb-1 text-danger">Formal alliances has been disabled in this game.</p>

    <p class="mb-2" v-if="isFormalAlliancesEnabled">
      Declare your diplomatic statuses to players.
    </p>

    <form-error-list :errors="errors" />

    <div class="row" v-if="!isLoading && isFormalAlliancesEnabled">
      <div class="table-responsive">
        <table class="table table-sm table-striped mb-0">
          <tbody>
            <diplomacy-row
              v-for="diplomaticStatus in diplomaticStatuses"
              :key="diplomaticStatus.playerId"
              :diplomaticStatus="diplomaticStatus"
              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
              @onApiRequestError="onApiRequestError"
              @onApiRequestSuccess="onApiRequestSuccess"/>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-2" v-if="isFormalAlliancesEnabled">
      <hr/>

      <h5>Alliance Settings</h5>

      <ul>
        <li>
          <small>If you are allied with another player, you can visit their stars.</small>
        </li>
        <li>
          <small>Combat will not occur if all players at a star are <span class="text-warning">allied</span> with the star owner.</small>
        </li>
        <li v-if="isTradeRestricted">
          <small>You are only allowed to trade with allies.</small>
        </li>
        <li v-if="isMaxAlliancesEnabled">
          <small>You may only ally with a maximum of <span class="text-warning">{{ maxAlliances }} player(s)</span>.</small>
        </li>
        <li v-if="isAllianceUpkeepEnabled">
          <small>An alliance <span class="text-warning">upkeep cost</span> will be deducted at the end of every cycle based on your cycle income.</small>
        </li>
        <li v-if="isAllianceUpkeepEnabled">
          <small>Establishing an alliance will incur an <span class="text-warning">upfront upkeep fee</span> based on your cycle income.</small>
        </li>
      </ul>

      <p class="pb-2">
        See the <a href="https://solaris-games.github.io/solaris-docs/diplomacy#diplomatic-statuses" target="_blank">wiki</a> for more details.
      </p>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import DiplomacyApiService from '../../../../services/api/diplomacy'
import DiplomacyRowVue from './DiplomacyRow.vue'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import FormErrorList from '../../../components/FormErrorList.vue'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner,
    'diplomacy-row': DiplomacyRowVue,
    'form-error-list': FormErrorList
  },
  data () {
    return {
        isLoading: false,
        errors: [],
        diplomaticStatuses: []
    }
  },
  mounted () {
    this.loadDiplomaticStatus();
  },
  created () {
    this.$socket.subscribe('playerDiplomaticStatusChanged', this.onPlayerDiplomaticStatusChanged)
  },
  unmounted () {
    this.$socket.unsubscribe('playerDiplomaticStatusChanged')
  },
  methods: {
    onOpenPlayerDetailRequested(playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    // TODO: This is super lazy
    onApiRequestSuccess (e) {
      this.errors = []
    },
    onApiRequestError (e) {
      this.errors = e.errors
    },
    async loadDiplomaticStatus () {
      if (!this.isFormalAlliancesEnabled) {
        return
      }

      try {
        this.isLoading = true

        let response = await DiplomacyApiService.getDiplomaticStatus(this.$store.state.game._id)

        if (response.status === 200) {
          this.diplomaticStatuses = response.data
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    },
    onPlayerDiplomaticStatusChanged (e) {
        let diplomaticStatus = this.diplomaticStatuses.find(d => d.playerIdTo === e.diplomaticStatus.playerIdFrom);

        if (diplomaticStatus) {
            diplomaticStatus.statusTo = e.diplomaticStatus.statusFrom;
            diplomaticStatus.statusFrom = e.diplomaticStatus.statusTo;
            diplomaticStatus.actualStatus = e.diplomaticStatus.actualStatus;
        }
    }
  },
  computed: {
    isFormalAlliancesEnabled () {
      return DiplomacyHelper.isFormalAlliancesEnabled(this.$store.state.game)
    },
    isTradeRestricted () {
      return DiplomacyHelper.isTradeRestricted(this.$store.state.game)
    },
    isMaxAlliancesEnabled () {
      return DiplomacyHelper.isMaxAlliancesEnabled(this.$store.state.game)
    },
    maxAlliances() {
      return DiplomacyHelper.maxAlliances(this.$store.state.game)
    },
    isAllianceUpkeepEnabled () {
      return DiplomacyHelper.isAllianceUpkeepEnabled(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }
}
</style>
