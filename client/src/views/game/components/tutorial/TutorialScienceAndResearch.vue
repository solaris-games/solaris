<template>
    <div>
        <div v-if="page === 0">
            <h5>Introduction to Science</h5>
            <p>
                Science Infrastructure on a star determines the proficiency of research into new technologies which
                grant bonuses and/or new abilities to the player. Each point of Science on a star contributes 1 point of
                research each tick towards a chosen technology.
            </p>
            <p>
                Open up the research window for your home star. Each technology listed grants a tangible bonus or
                ability to any side that researches them. You have the option to choose what you are researching right
                now, and what to research next.
            </p>
        </div>

        <div v-if="page === 1">
            <h5>Scanning</h5>
            <p>
                Scanning refers to the ability to get details about surrounding stars. Click on a star owned by a
                player, a circle surrounding the star indicates its scanning range. Other stars within scanning range
                will have the number of enemy ships and infrastructure present available on the map. When clicked on,
                objects outside the scanning range will appear with "?" in place of data.
            </p>
            <p>
                <span class="text-warning">Hint:</span> In a real game, it is important to scan planets before
                attempting to capture them, as to avoid running into a superior number of enemy ships or defenses.
            </p>
        </div>

        <div v-if="page === 2">
            <h5>Hyperspace Range</h5>
            <p>
                Hyperspace Range refers to the maximum distance a ship/carrier is able to travel from its station. Click
                on a star owned by a player, a jagged circle will appear - this is the range wherein ships/carriers
                stationed on the star may travel.
            </p>
        </div>

        <div v-if="page === 3">
            <h5>Scenario Objective</h5>
            <p>
                This scenario ends when the player has captured the neutral star on the map. The player will need to
                utilize skills from the past 2 tutorials in order to complete the task. The player may attempt to
                capture the neutral star before scanning it, but there is a random chance that the neutral star will be
                occupied by enemy ships, so be careful!
            </p>
        </div>
    </div>
</template>

<script>
import tutorialMixin from './tutorialMixin';
export default {
    mixins: [tutorialMixin],
    mounted: function () {
        this.setTutorial("Tutorial - Science and Research", 3)
    },
}
</script>

<style scoped>
</style>
