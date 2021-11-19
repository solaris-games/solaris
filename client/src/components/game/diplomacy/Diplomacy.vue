<template>
<div class="menu-page container">
    <menu-title title="Diplomacy" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoading"/>

    <p v-if="!isFormalAlliancesEnabled" class="pb-2">Formal alliances has been disabled in this game.</p>

    <p class="mb-2">
      Declare your diplomatic statuses to players.
    </p>

    <div class="row" v-if="!isLoading && isFormalAlliancesEnabled">
      <div class="table-responsive">
        <table class="table table-sm table-striped mb-0">
          <tbody>
            <diplomacy-row 
              v-for="diplomaticStatus in diplomaticStatuses" 
              :key="diplomaticStatus.playerId"
              :diplomaticStatus="diplomaticStatus"
              @onPlayerDetailRequested="onPlayerDetailRequested"/>
          </tbody>
        </table>
      </div>
    </div>

    <p class="mt-2 pb-2">
      <small>
        If you are allied with another player, you can visit their stars.
        <br/>
        Combat will not occur if all players at a star are allied with the star owner. See the help guide for more details.
      </small>
    </p>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import LoadingSpinner from '../../LoadingSpinner'
import DiplomacyApiService from '../../../services/api/diplomacy'
import DiplomacyRowVue from './DiplomacyRow'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner,
    'diplomacy-row': DiplomacyRowVue
  },
  data () {
    return {
        isLoading: false,
        diplomaticStatuses: []
    }
  },
  mounted () {
    this.loadDiplomaticStatus();
  },
  created () {
    this.sockets.subscribe('playerDiplomaticStatusChanged', this.onPlayerDiplomaticStatusChanged)
  },
  destroyed () {
    this.sockets.unsubscribe('playerDiplomaticStatusChanged')
  },
  methods: {
    onPlayerDetailRequested(playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
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
      return GameHelper.isFormalAlliancesEnabled(this.$store.state.game)
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
