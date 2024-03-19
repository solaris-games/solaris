import GameHelper from '../gameHelper'
import MENU_STATES from './menuStates'

export default [
    {
      title: "Camera zoom",
      text: "Zoom in and out with the MOUSE WHEEL or <code>+</code> and <code>-</code> keys.",
      onZoom: function (concept) {
        this.markLearned(concept, 10)
      }
    },
    {
      title: "Carriers",
      text: "Carriers are used to transport Ships through hyperspace to reach other Stars. They can only be built at Stars and must hold a minimum of 1 Ship.\nCarriers are displayed as small ship icons with a circular coloured halo, much like stars. The number of ships that a carrier has will be displayed when zoomed in.\nClick on the carrier to view it in detail.",
      onMenuRequested: function (concept, menuState) {
        if (menuState.state === MENU_STATES.CARRIER_DETAIL) {
            this.markLearned(concept, 40)
        }
      }
    },
    {
      title: "Capital Star",
      text: "The Capital Star is your home world. You can recognize as it has 9 points.\nSelect your Capital Star and view its details.",
      onMenuRequested: function (concept, menuState) {
        if (menuState.state === MENU_STATES.STAR_DETAIL) {
          const starId = menuState.args
          const star = GameHelper.getStarById(this.$store.state.game, starId)
          if (star.homeStar) {
            this.markLearned(concept)
          }
        }
      }
    },
    {
      title: "Bulk Upgrade",
      text: "TODO."
    },
]
