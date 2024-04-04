<template>
    <div>
        <div v-if="page === 0">
            <h5>Introduction</h5>
            <p>
                Stars can be either Normal or Special - the only difference with Special stars is that they grant
                bonuses (and/or penalties) to the controlling player. Knowing what each Special Star type does is
                essential in order for players to effectively plan strategy. Click on any star to display more
                information about the star in question.
            </p>
        </div>

        <div v-if="page === 1">
            <h5>Star Types</h5>
            <ul>
                <li><strong>Black Hole</strong> - +3 Scanning Range, reduced natural resources.</li>
                <li><strong>Nebula</strong> - Conceals Infrastructure and Ship Count from enemies.</li>
                <li><strong>Asteroid Field</strong> - +1 Defending bonus in combat.</li>
                <li><strong>Binary</strong> - Possesses additional natural resources.</li>
                <li><strong>Worm Hole</strong> - Provides 1-tick travel between 2 planets with an associated Worm Hole.</li>
                <li><strong>Pulsar</strong> - Always visible to all players in a game.</li>
            </ul>

            <p>
                For official games, 2 Special Stars are banned from the pool for a month. This is reset on the first of
                every month. Players are encouraged to check these bans before an official game to optimize strategy and
                planning.
            </p>
        </div>

        <div v-if="page === 2">
            <h5>Warp Gates</h5>
            <p>
                Players can build Warp Gates on a controlled star - these improve the speed of carriers by 3x (stacks
                with other modifiers). A Warp Gate is indicated by the double-ring displayed on a star.
            </p>
        </div>

        <div v-if="page === 3">
            <h5>Challenge</h5>
            <p>
                Your goal in this scenario is to locate and capture all the stars on the map before the end of 200
                ticks. In order to do so, you must:
            </p>
            <ul>
                <li>Capture a Black Hole to increase scanning range.</li>
                <li>Build a Warp Gate between your Home star and the closest Binary star to transport ships faster.</li>
            </ul>
        </div>
    </div>
</template>

<script>
import tutorialMixin from './tutorialMixin';
export default {
    mixins: [tutorialMixin],
    mounted: function () {
        this.setTutorial("Tutorial - Special Star Types", 3)
    },
}
</script>

<style scoped>
</style>
