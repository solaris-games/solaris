import GameHelper from '../../../../services/gameHelper'
import MENU_STATES from '../../../../services/data/menuStates'

export default {
    methods: {
        onOpenStarDetailRequested(e) {
            this.$parent.$emit('onOpenStarDetailRequested', this.getPlayerHomeStar._id)
        },
        onOpenTutorialRequested () {
            this.$store.commit('setMenuState', {
                state: MENU_STATES.TUTORIAL
            })
        },
        setTutorial(title, maxPage) {
            this.$parent.title = title
            this.$parent.maxPage = maxPage
        },
        setTutorialCompleted() {
            this.$parent.setTutorialCompleted()
        }
    },
    computed: {
        game () {
            return this.$store.state.game
        },
        gameIsFinished () {
            return GameHelper.isGameFinished(this.game)
        },
        userPlayer() {
            return GameHelper.getUserPlayer(this.game)
        },
        getStarCount() {
            return GameHelper.getStarsOwnedByPlayer(this.userPlayer, this.game.galaxy.stars)
        },
        getStarsForVictory() {
            return this.game.state.starsForVictory
        },
        getPlayerHomeStar() {
            return GameHelper.getPlayerHomeStar(this.userPlayer, this.game.galaxy.stars)
        },
        getStartingStars() {
            return this.game.settings.player.startingStars
        },
        getCreatedFromTemplate() {
            return this.game.settings.general.createdFromTemplate
        },
        page() {
            return this.$parent.page
        },
        isTutorialCompleted() {
            return this.$parent.isTutorialCompleted
        },
        menuState () {
            return this.$store.state.menuStateChat
        },
        documentationUrl() {
            return import.meta.env.VUE_APP_DOCUMENTATION_URL
        }
    }
}
