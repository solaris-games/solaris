<template>
    <div class="row mb-1 bg-dark pt-2 pb-2" v-if="game.settings.general.isGameAdmin">
        <div class="col">
            <button class="btn btn-danger" v-if="!game.state.startDate"
                @click="deleteGame">Delete Game</button>
            <button class="btn btn-warning" v-if="canModifyPauseState() && !game.state.paused" @click="pauseGame">Pause
                Game</button>
            <button class="btn btn-warning" v-if="canModifyPauseState() && game.state.paused" @click="resumeGame">Resume
                Game</button>
            <button class="btn btn-danger ms-1" v-if="!game.state.startDate"
                @click="forceStartGame">Force start Game</button>
            <button class="btn btn-warning ms-1"
                v-if="game.state.startDate && !game.state.endDate && !game.state.forceTick"
                @click="fastForwardGame">Fast Forward Game</button>

            <view-collapse-panel @onToggle="togglePlayerControl" title="Player Control">
                <game-player-control :game="fullGame" />
            </view-collapse-panel>
        </div>
    </div>
</template>
<script>
import GameHelper from '../../services/gameHelper'
import ViewCollapsePanel from '../components/ViewCollapsePanel.vue'
import GamePlayerControl from './GamePlayerControl.vue';
import gameService from '../../services/api/game'

export default {
    components: {
        'view-collapse-panel': ViewCollapsePanel,
        'game-player-control': GamePlayerControl,
    },
    props: {
        game: Object,
    },
    data () {
        return {
            fullGame: null,
        }
    },
    methods: {
        canModifyPauseState() {
            return this.game.settings.general.isGameAdmin
                && GameHelper.isGameStarted(this.game)
                && !GameHelper.isGamePendingStart(this.game)
                && !GameHelper.isGameFinished(this.game);
        },
        async togglePlayerControl (collapsed) {
            if (!collapsed && !this.fullGame) {
                await this.loadFullGame();
            }
        },
        async loadFullGame () {
            const resp = await gameService.getGameGalaxy(this.game._id);

            this.fullGame = resp.data;
        }
    }
}
</script>
<style scoped></style>
