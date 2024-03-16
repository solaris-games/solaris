import GameHelper from '../../../../services/gameHelper'

export default {
    methods: {
        onOpenStarDetailRequested(e) {
            this.$parent.$emit('onOpenStarDetailRequested', this.getPlayerHomeStar._id)
        },
        setTutorial(title, maxPage) {
            this.$parent.title = title
            this.$parent.maxPage = maxPage
        }
    },
    computed: {
        userPlayer() {
            return GameHelper.getUserPlayer(this.$store.state.game)
        },
        getStarCount() {
            return GameHelper.getStarsOwnedByPlayer(this.userPlayer, this.$store.state.game.galaxy.stars)
        },
        getStarsForVictory() {
            return this.$store.state.game.state.starsForVictory
        },
        getPlayerHomeStar() {
            return GameHelper.getPlayerHomeStar(this.userPlayer, this.$store.state.game.galaxy.stars)
        },
        getStartingStars() {
            return this.$store.state.game.settings.player.startingStars
        },
        getCreatedFromTemplate() {
            return this.$store.state.game.settings.general.createdFromTemplate
        },
        page() {
            return this.$parent.page
        },
        documentationUrl() {
            return process.env.VUE_APP_DOCUMENTATION_URL
        }
    }
}
