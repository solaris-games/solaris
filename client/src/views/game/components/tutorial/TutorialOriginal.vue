<template>
<div>
    <div v-if="page === 0">
        <p>
            Welcome to the <strong>Solaris</strong> tutorial, this tutorial aims to cover the basics on how to play.
            Template:
        </p>

        <p>
            By the end of this tutorial you will have learned:
        </p>

        <ul>
            <li>What game ticks are</li>
            <li>How to build star infrastructure</li>
            <li>How to build carriers</li>
            <li>How to capture stars</li>
            <li>How to research new technologies</li>
            <li>How to win the game</li>
        </ul>

        <div class="ratio ratio-16x9 mb-2">
            <iframe src="https://www.youtube.com/embed/cnRXQMQ43Gs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>

        <p class="pb-2">
            The full Solaris wiki can be found <a :href="documentationUrl" target="_blank">here</a>.
        </p>
    </div>

    <div v-if="page === 1">
        <h5>The Basics</h5>

        <p>
            The game runs in <strong>ticks</strong>, in standard games these occur once every <span class="text-warning">30 minutes</span>.
            Every time a tick occurs, carriers will move, ships are built, research is conducted, combat between players is performed and stars are captured.
        </p>

        <p>
            <span class="text-danger">Solaris is a slow game</span>, carriers travel in real-time and <span class="text-danger">will take real hours to complete.</span>
            It is perfectly normal to play a couple of minutes and come back hours later.
            In the meantime, many players will plan their next steps and engage in diplomacy.
        </p>

        <p class="text-warning">
            <i>Note: This tutorial is <strong>turn based</strong>, use the green tick at the top right to submit your turn and the game will progress within a few seconds.</i>
        </p>
    </div>

    <div v-if="page === 2">
        <h5>Galaxy</h5>

        <p>
            The map currently displays <strong>Stars</strong> and <strong>Carriers</strong> controlled by you and your opponent.
            <span class="text-danger">Try zooming in and panning around to get a closer look</span>.
        </p>

        <h5>Stars</h5>

        <p>
            Stars on the map are displayed with their name, how many ships are garrisoned and how much infrastructure the star has.
            Stars controlled by players are coloured with the player's colour and stars that do not have an owner do not have a colour displayed.
        </p>

        <p>
            To win a game of Solaris, you must capture a specified number of stars. You are currently in control of <span class="text-info">{{getStarCount.length}} stars</span>
            and you need to capture <span class="text-warning">{{getStarsForVictory}} stars</span> to win the game and end the tutorial.
        </p>
    </div>

    <div v-if="page === 3">
        <h5>Infrastructure</h5>

        <p>
            There are 3 types of infrastructure that can be built at stars, these are:
        </p>

        <ul>
            <li><strong class="text-success">Economy</strong> - Generates income</li>
            <li><strong class="text-warning">Industry</strong> - Builds ships</li>
            <li><strong class="text-info">Science</strong> - Contributes to research</li>
        </ul>

        <p>
            At the start of the game, you are in control of <span class="text-info">{{getStartingStars}} stars</span>. Click on a star on the map
            to view the star detail screen.
        </p>

        <p>
            <span class="text-danger">Try upgrading the <strong>Industry</strong> infrastructure on one of your stars</span>, this will increase the build speed of ships at the star.
        </p>

        <p>
            The numbers displayed directly above stars on the map are the <span class="text-success">Economy</span>, <span class="text-warning">Industry</span> and <span class="text-info">Science</span> (<span class="text-success me-1">E</span><span class="text-warning me-1">I</span><span class="text-info">S</span>) values of the star.
        </p>

        <p class="text-warning">
            <i>Submit your turn and in a few seconds you will see ships being built at stars.</i>
        </p>
    </div>

    <div v-if="page === 4">
        <h5>Carriers &amp; Waypoints</h5>

        <p>
            In order to capture stars, you must build <strong>Carriers</strong>, use carriers to transport ships 
            across the galaxy to stars in order to capture them. A carrier must have at least 1 ship.
        </p>

        <p>
            Carriers can only be built at stars with garrisoned ships, <span class="text-danger">click on any of your stars and build a carrier there</span>.
        </p>
    </div>

    <div v-if="page === 5">
        <h5>Capturing Stars</h5>

        <p>
            Once you've built the carrier, edit the waypoints of the carrier to travel to stars that you do not own to capture them, 
            make sure you <span class="text-danger">load the carrier with enough ships</span> in case they run into a combat situation.
        </p>

        <p>
            At the start of the game, your capital star <a href="javascript:;" @click="onOpenStarDetailRequested">{{getPlayerHomeStar.name}}</a> has a carrier for free.
            Use this carrier to plot waypoints to stars.
        </p>

        <p class="text-warning">
            <i>Submit your turn and in a few seconds you will your carriers follow their waypoints and travel to nearby stars.</i>
        </p>
    </div>

    <div v-if="page === 6">
        <h5>Research &amp; Technology</h5>

        <p>
            Researching technology upgrades is critical in order to stay ahead of your opponents. 
            Technology is researched every tick using the <span class="text-info">Science</span> infrastructure built at your stars.
            The more science your stars have, the faster you will research new technologies.
        </p>

        <p>
            <span class="text-danger">Use the menu at the <strong>top right</strong> of the screen to navigate to the <strong>Research</strong> screen</span> and set your current research
            to <span class="text-info">Weapons</span>. This will make your ships more powerful and hit harder in combat once researched.
        </p>

        <p class="text-warning">
            <i>Submit your turn and in a few seconds you will see your research points increase.</i>
        </p>
    </div>

    <div v-if="page === 7">
        <h5>How to Win</h5>

        <p>
            To win a game of Solaris, you must capture a specified number of stars. You are currently in control of <span class="text-info">{{getStarCount.length}} stars</span>
            and you need to capture <span class="text-warning">{{getStarsForVictory}} stars</span> to win the game and end the tutorial.
        </p>

        <p class="text-danger">
            Keep producing ships, building carriers and plotting waypoints. Eliminate your opponent and capture the <strong>entire map</strong> to win this tutorial.
        </p>
    </div>
</div>
</template>

<script>
import tutorialMixin from './tutorialMixin';
export default {
    mixins: [tutorialMixin],
    mounted: function () {
        this.setTutorial("Tutorial", 7)
    }
}
</script>

<style scoped>
</style>
