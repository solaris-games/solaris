<template>
    <div>
        <div v-if="page === 0">
            <h5>Introduction to Infrastructure</h5>
            <p>
                All stars have 3 types of Infrastructure. These include Economy, Industry and Science.
            </p>
            <ul>
                <li>Economy - Generates income</li>
                <li>Industry - Shipbuilding proficiency</li>
                <li>Science - Research proficiency </li>
            </ul>
        </div>

        <div v-if="page === 1">
            <h5>Resources</h5>
            <p>
                The natural resources present on a star will determine the cost to build infrastructure, the higher
                the number of resources, the lower costs will be. Stars with inherent natural resources are
                exceptionally
                important in an actual game and are highly sought after.
            </p>
        </div>

        <div v-if="page === 2">
            <h5>Production Cycle</h5>
            <p>
                Every 24 ticks, the game completes an individual Production Cycle, a production cycle directly impacts:
            </p>
            <ul>
                <li>Economy</li>
                <li>Bank Technology</li>
                <li>Exp Technology</li>
            </ul>
            <p>
                In turn-based games only, there is an option "Ready to Cycle" which automatically submits turns until
                the next production cycle. Most games are done in real-time and so orders are often made and submitted
                in advance.
            </p>
        </div>

        <div v-if="page === 3">
            <h5>Objective</h5>
            <p>
                In this scenario, you will start with a single star with no Infrastructure. Your task is to build up the
                Economy
                and Industry of the star enough to build 100 ships, and then to take the neutral star on the map. The
                neutral
                star has defenders present, so you will need at least 100 ships in order to survive the capture attempt.
            </p>
            <p>
                <span class="text-warning">Combat:</span>
                When friendly ships occupy the same star as enemy ships, combat occurs. This scenario requires that you
                generate
                at least 100 ships in order to win the combat. Granular details of combat will be explained later in
                this tutorial.
                The results of any combat will be posted in the messages window on the top right.
            </p>
            <p>
                <span class="text-warning">Hint:</span>
                In this scenario, you will be buying Economy and Industry Infrastructure and ending your turn until you
                have generated
                enough ships to win. The better you develop your infrastructure, the quicker you will complete the
                scenario - try to
                complete it in as few ticks as possible.
            </p>
        </div>

        <div v-if="page === 4">
            <h5>Conclusion</h5>
            <p>
                Congratulations! You successfully completed the second tutorial. Follow onto the next.
            </p>
        </div>
    </div>
</template>

<script>
import tutorialMixin from './tutorialMixin';
export default {
    mixins: [tutorialMixin],
    mounted: function () {
        this.setTutorial("Tutorial - Infrastructure and Expansion", 4)
    }
}
</script>

<style scoped>
</style>
