<template>
    <div>
        <div v-if="page === 0">
            <h5>Introduction</h5>
            <p>
                In this tutorial, you will learn how to purchase a carrier, move the carrier and capture neutral stars.
                The tutorial window may close - you can return to your place in the tutorial at any time by pressing the
                yellow tutorial button on the upper right of the window.
                <div class="ms-4">
                    <div class="btn btn-sm btn-warning">
                        <i class="fas fa-user-graduate"></i>
                        <span class="d-none d-md-inline-block ms-1">Tutorial</span>
                    </div>
                </div>
            </p>

            <p>
                <span class="text-warning">Important:</span> While Solaris has 30 minute turns (Ticks) and is played over a long period of real-time, this
                tutorial is turn based. Use the green check at the top right to end your turn.
                <div class="ms-4">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" title="End your turn"><i class="fas fa-check"></i></button>
                        <button class="btn btn-sm btn-success dropdown-toggle dropdown-toggle-split">
                            <span class="sr-only">Toggle Dropdown</span>
                        </button>
                    </div>
                </div>
            </p>

            <p>
                Currently displayed is the game map, it features both Stars and Carriers belonging to you and your
                opponent. Try zooming in/out and panning to get a closer look at the galaxy.
            </p>
        </div>

        <div v-if="page === 1">
            <h5>Stars</h5>

            <p>
                Stars include 3 variables (termed Infrastructure), Economy (ECO), Industry (IND) and Science (SCI) -
                they also display the name of the star and the number of carriers/ships present. A 9-point star is a
                home star, while a 6-point star is a normal star.
            </p>

            <p>
                To win a real game, players must capture a predetermined number of stars. For this tutorial, you are in
                control of 2 stars and must capture 2 more stars (4 total) in order to complete the tutorial.
            </p>
        </div>

        <div v-if="page === 2">
            <h5>Shipbuilding</h5>

            <p>
                Click on a star that belongs to you, and then click on the star-icon to access available construction.
            </p>
            <p>
                To build a carrier, click on one of your stars and click Build Carrier for 25$. The next window will
                ask you how many ships to load onto the Carrier, for now, go with the max of 30.
            </p>
            <p>
                After building the carrier, the option to set waypoints will appear. Use this to set a destination
                for the new carrier. Click on one of the neutral stars on the map to set a waypoint to that destination
                and then click save to finish setting the waypoint.
            </p>
            <p>
                Lets build another carrier on your other star and set a course for another neutral star. Repeat the same
                process.
            </p>
            <p>
                After construction, it will take several ticks for the ships to reach their destination. Click the
                end turn button until one of the carriers has reached their destination.
            </p>
        </div>

        <div v-if="page === 3">
            <h5>Conclusion</h5>
            <p>
                Congratulations! You just successfully captured your first neutral star, the first step towards your
                eventual domination of the universe! To complete this tutorial, continue building carriers and capture 2
                more neutral stars.
            </p>
        </div>
    </div>
</template>

<script>
import tutorialMixin from './tutorialMixin';
export default {
    mixins: [tutorialMixin],
    mounted: function () {
        this.setTutorial("Tutorial - Stars and Carriers", 3)
        // if (this.gameIsFinished) {
        //     console.log("FINISHED")
        //     this.setTutorialCompleted()
        // }
    },
    // watch: {
    //     game (newGame, _oldGame) {
    //         console.log("GAME UPDATE", newGame)
    //         if (this.gameIsFinished) {
    //             this.setTutorialCompleted()
    //         }
    //     }
    // }
}
</script>

<style scoped>
</style>
