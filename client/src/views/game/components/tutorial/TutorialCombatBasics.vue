<template>
    <div>
        <div v-if="page === 0">
            <h5>Introduction</h5>
            <p>
                Your ultimate test is here: capture the enemy's home star! To achieve victory, develop your Economy,
                Industry and Science. The enemy won't attack first, but you must complete your mission within 200 ticks
                or face defeat.
            </p>
        </div>

        <div v-if="page === 1">
            <h5>Combat Quick Summary</h5>
            <p>
                Combat occurs when your carriers reach an enemy star or intercept an enemy carrier. Battles will hinge
                on your ship count and Weapons Technology levels.The defender always receives a +1 bonus in combat.
            </p>
        </div>

        <div v-if="page === 2">
            <h5>Conclusion</h5>
            <p>
                Congratulations! You have completed basic training and are ready for the advanced scenarios.
            </p>
        </div>
    </div>
</template>

<script>
import tutorialMixin from './tutorialMixin';
export default {
    mixins: [tutorialMixin],
    mounted: function () {
        this.setTutorial("Tutorial - Combat Basics", 2)
    },
}
</script>

<style scoped>
</style>
