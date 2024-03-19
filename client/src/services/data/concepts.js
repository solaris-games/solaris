import GameHelper from '../gameHelper'
import LearningHelper from '../learningHelper'
import MENU_STATES from './menuStates'

export default [
    {
        id: LearningHelper.concept.CAMERA_PAN,
        title: "Camera pan",
        text: "Move across the map by clicking and dragging with any MOUSE BUTTON.\nPress the <code>h</code> or <code>space</code> keyboard shortcut to return to your Home star.",
        priority: 10,
        onConceptUsed: function (self) {
            this.markLearned(self, 20)
        }
    },
    {
        id: LearningHelper.concept.CAMERA_ZOOM,
        title: "Camera zoom",
        text: "Zoom in and out with the MOUSE WHEEL or <code>+</code> and <code>-</code> keys.",
        priority: 10,
        onConceptUsed: function (self) {
            this.markLearned(self, 20)
        }
    },
    {
        id: LearningHelper.concept.CARRIERS,
        title: "Carriers",
        text: "Carriers are used to transport Ships through hyperspace to reach other Stars. They can only be built at Stars and must hold a minimum of 1 Ship.\nCarriers are displayed as small ship icons <i class='fas fa-rocket'></i> with a circular coloured halo, much like stars. The number of ships that a carrier has will be displayed when zoomed in.\nClick on the carrier to view it in detail.",
        priority: 20,
        pre: [LearningHelper.concept.CAMERA_ZOOM],
        onMenuRequested: function (self, menuState) {
            if (menuState.state === MENU_STATES.CARRIER_DETAIL) {
                this.markLearned(self, 40)
            }
        }
    },
    {
        id: LearningHelper.concept.CAPITAL_STAR,
        title: "Capital Star",
        text: "The Capital Star is your home world. You can recognize as it has 9 points.\nSelect your Capital Star and view its details.",
        priority: 20,
        pre: [LearningHelper.concept.CAMERA_ZOOM],
        onMenuRequested: function (self, menuState) {
            if (menuState.state === MENU_STATES.STAR_DETAIL) {
                const starId = menuState.args
                const star = GameHelper.getStarById(this.$store.state.game, starId)
                if (star.homeStar) {
                    this.markLearned(self)
                }
            }
        }
    },
    {
        id: LearningHelper.concept.BULK_UPGRADE,
        title: "Bulk Upgrade",
        text: "Improve your infrastructure by spending your budget on the cheapest expansions first.\nAccess Bulk Upgrade <i class='fas fa-money-bill'></i> from the menu / sidebar or using the <code>b</code> keyboard shortcut.",
        priority: 100,
        pre: [LearningHelper.concept.CARRIERS],
        onConceptUsed: function (self) {
            this.markLearned(self)
        }
    },
    {
        id: LearningHelper.concept.COMBAT_CALCULATOR,
        title: "Combat Calculator",
        text: "Use this handy tool to predict the outcome of combat based on the weapon levels and numbers of the Attacker and Defender.\nAccess the Combat Calculator <i class='fas fa-calculator'></i> from the menu / sidebar, using the <code>c</code> keyboard shortcut or from the Carrier detail window.",
        priority: 100,
        pre: [LearningHelper.concept.CARRIERS],
        onConceptUsed: function (self) {
            this.markLearned(self)
        }
    },
]
