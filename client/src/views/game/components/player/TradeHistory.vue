<template>
    <div>
        <div class="row">
            <div class="col">
                <h4 class="mt-2">Trade History</h4>
            </div>
            <div class="col-auto">
                <button class="btn btn-sm btn-outline-success mt-2" @click="loadTradeEvents" :disabled="isLoading"><i class="fas fa-sync"></i> Refresh</button>
            </div>
        </div>

        <loading-spinner :loading="isLoading"/>

        <p v-if="!isLoading && !tradeEvents.length" class="text-center mb-0 pb-2">
            <small>You have not traded with this player.</small>
        </p>

        <div v-if="!isLoading && tradeEvents.length">
            <div class="row" v-for="event in tradeEvents" :key="event._id">
                <div class="col">
                    <p v-if="event.data.renown" class="mb-1">
                        <i class="me-1 fas" :class="{'fa-arrow-right text-danger': event.data.toPlayerId, 'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
                        <span>{{event.data.renown}} <span class="text-warning">renown</span>.</span>
                    </p>
                    <p v-if="event.data.credits" class="mb-1">
                        <i class="me-1 fas" :class="{'fa-arrow-right text-danger': event.data.toPlayerId, 'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
                        <span>{{event.data.credits}} <span class="text-warning">credits</span>.</span>
                    </p>
                    <p v-if="event.data.creditsSpecialists" class="mb-1">
                        <i class="me-1 fas" :class="{'fa-arrow-right text-danger': event.data.toPlayerId, 'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
                        <span>{{event.data.creditsSpecialists}} <span class="text-warning">specialist token(s)</span>.</span>
                    </p>
                    <p v-if="event.data.technology" class="mb-1">
                        <i class="me-1 fas" :class="{'fa-arrow-right text-danger': event.data.toPlayerId, 'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
                        <span>Level {{event.data.technology.level}} <span class="text-warning">{{getTechnologyFriendlyName(event.data.technology.name)}}</span></span>.
                    </p>
                    <p v-if="event.data.carrierShips" class="mb-1">
                        <i class="me-1 fas" :class="{'fa-arrow-right text-danger': event.data.toPlayerId, 'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
                        <span>{{event.data.carrierShips}} <span class="text-warning">ships</span>.</span>
                    </p>
                    <p v-if="event.type === 'playerDebtSettled'" class="mb-1">
                        <i class="me-1 fas" :class="{'fa-arrow-right text-danger': !isUserPlayerLedgerEventCreditor(event), 'fa-arrow-left text-success': isUserPlayerLedgerEventCreditor(event)}"></i>
                        <span>{{event.data.amount}} <span class="text-warning">credits</span> of debt <span class="text-warning">settled</span>.</span>
                    </p>
                    <p v-if="event.type === 'playerDebtForgiven'" class="mb-1">
                        <i class="me-1 fas" :class="{'fa-arrow-left text-success': !isUserPlayerLedgerEventCreditor(event), 'fa-arrow-right text-danger': isUserPlayerLedgerEventCreditor(event)}"></i>
                        <span>{{event.data.amount}} <span class="text-warning">credits</span> of debt <span class="text-warning">forgiven</span>.</span>
                    </p>
                </div>
                <div class="col-auto">
                    <p class="mt-0 mb-0">
                        <small><em>{{getDateString(event.sentDate)}}</em></small>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TradeApiService from '../../../../services/api/trade'
import GameHelper from '../../../../services/gameHelper'
import TechnologyHelper from '../../../../services/technologyHelper'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import moment from 'moment'

export default {
    components: {
        'loading-spinner': LoadingSpinner,
    },
    props: {
        toPlayerId: String
    },
    data () {
        return {
            isLoading: false,
            userPlayer: null,
            tradeEvents: []
        }
    },
    async mounted () {
        this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

        await this.loadTradeEvents()
    },
    methods: {
        async loadTradeEvents () {
            this.isLoading = true

            try {
                let response = await TradeApiService.listTradeEventsBetweenPlayers(this.$store.state.game._id, this.toPlayerId)

                if (response.status === 200) {
                    this.tradeEvents = response.data.sort((a, b) => moment(b.sentDate).utc().toDate() - moment(a.sentDate).utc().toDate())
                }
            } catch (err) {
                console.error(err)
            }

            this.isLoading = false
        },
        isTradeFromUserPlayer (tradeEvent) {
            return tradeEvent.data.toPlayerId
        },
        getTechnologyFriendlyName (key) {
            return TechnologyHelper.getFriendlyName(key)
        },
        getDateString (date) {
            return GameHelper.getDateString(date)
        },
        isUserPlayerLedgerEventCreditor (event) {
            if (event.type !== 'playerDebtSettled' && event.type !== 'playerDebtForgiven') {
                return false
            }

            const summary = GameHelper.getLedgerGameEventPlayerSummary(this.$store.state.game, event)

            return summary.isCreditor
        }
    }
}
</script>

<style scoped>
</style>
