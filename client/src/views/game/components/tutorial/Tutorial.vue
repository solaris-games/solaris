<template>
<div class="menu-page container pb-2">
    <menu-title :title="title" @onCloseRequested="onCloseRequested"/>

    <div class="row pb-2">
        <div class="col">
            <button type="button" title="Next" class="btn btn-primary" @click="prevPage()" v-if="page > 0"><i class="fas fa-arrow-left me-1"></i>Previous</button>
        </div>
        <div class="col-auto">
            <button type="button" title="Next" class="btn btn-success" @click="nextPage()" v-if="page < maxPage">Next<i class="fas fa-arrow-right ms-1"></i></button>
        </div>
    </div>

    <component v-bind:is="currentTutorialComponent"></component>

</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import TutorialOriginal from './TutorialOriginal.vue'
import TutorialFleetMovement from './TutorialFleetMovement.vue'

const defaultTutorialKey = "original"

export default {
    components: {
        'menu-title': MenuTitle,

        // these component names correspondent to the tutorials in server/config/game/tutorials.json
        // and the createdFromTemplate value in the game settings JSON under server/config/game/settings/user
        'tutorial-original': TutorialOriginal,
        'tutorial-fleet-movement': TutorialFleetMovement
    },
    data() {
        return {
            title: "Tutorial",
            tutorialKey: '',
            page: 0,
            maxPage: 0
        }
    },
    mounted() {
        this.tutorialKey = this.$store.state.game.settings.general.createdFromTemplate || defaultTutorialKey
        this.page = this.$store.state.tutorialPage || 0
        if (typeof this.page === 'string') {
            if (this.page.split('|')[0] !== this.tutorialKey) {
                this.page = 0
            } else {
                this.page = parseInt(this.page.split('|')[1])
            }
        }
    },
    methods: {
        onCloseRequested(e) {
            this.$emit('onCloseRequested', e)
        },
        nextPage() {
            this.page++

            this.$store.commit('setTutorialPage', this.tutorialKey + '|' + this.page)
        },
        prevPage() {
            this.page = Math.max(this.page - 1, 0)

            this.$store.commit('setTutorialPage', this.tutorialKey + '|' + this.page)
        }
    },
    computed: {
        currentTutorialComponent() {
            return 'tutorial-' + this.$store.state.game.settings.general.createdFromTemplate || defaultTutorialKey
        }
    }
}
</script>

<style scoped>
</style>
