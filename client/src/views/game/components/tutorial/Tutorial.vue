<template>
<div class="menu-page container pb-2">
    <menu-title :title="title" @onCloseRequested="onCloseRequested"/>

    <div class="row pb-2">
        <div class="col">
            <button type="button" title="Next" class="btn btn-primary" @click="prevPage()" v-if="page > 0"><i class="fas fa-arrow-left me-1"></i>Previous</button>
        </div>
        <div class="col-auto">
            <button type="button" title="Next" class="btn btn-success" @click="nextPage()" v-if="page >= 0 && page < maxPage">Next<i class="fas fa-arrow-right ms-1"></i></button>
        </div>
    </div>

    <component v-bind:is="currentTutorialComponent"></component>

</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import TutorialOriginal from './TutorialOriginal.vue'
import TutorialStarsAndCarriers from './TutorialStarsAndCarriers.vue'
import TutorialInfrastructureAndExpansion from './TutorialInfrastructureAndExpansion.vue'
import TutorialScienceAndResearch from './TutorialScienceAndResearch.vue'
import TutorialCombatBasics from './TutorialCombatBasics.vue'
import TutorialSpecialStarTypes from './TutorialSpecialStarTypes.vue'

import TutorialFleetMovement from './TutorialFleetMovement.vue'

const defaultTutorialKey = "original"

export default {
    components: {
        'menu-title': MenuTitle,

        // these component names correspondent to the tutorials in server/config/game/tutorials.json
        // and the createdFromTemplate value in the game settings JSON under server/config/game/settings/user
        'tutorial-original': TutorialOriginal,
        'tutorial-fleet-movement': TutorialFleetMovement,
        'tutorial-stars-and-carriers': TutorialStarsAndCarriers,
        'tutorial-infrastructure-and-expansion': TutorialInfrastructureAndExpansion,
        'tutorial-science-and-research': TutorialScienceAndResearch,
        'tutorial-combat-basics': TutorialCombatBasics,
        'tutorial-special-star-types': TutorialSpecialStarTypes,
    },
    data() {
        return {
            title: "Tutorial",
            tutorialKey: '',
            page: 0,
            maxPage: 0
        }
    },
    created() {
        this.tutorialKey = this.$store.state.game.settings.general.createdFromTemplate || defaultTutorialKey
    },
    mounted() {
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
        },
        setTutorialCompleted() {
            this.page = -1
            this.$store.commit('setTutorialPage', this.tutorialKey + '|' + this.page)
            // TODO check why this doesn't always work
            // this.onOpenTutorialRequested()
        }
    },
    computed: {
        currentTutorialComponent() {
            return 'tutorial-' + this.$store.state.game.settings.general.createdFromTemplate || defaultTutorialKey
        },
        isTutorialCompleted() {
            return this.page === -1
        }
    }
}
</script>

<style scoped>
</style>
