import * as PIXI from 'pixi.js'
import gameContainer from './container'
import Star from './star'
import EventEmitter from 'events'
import GameHelper from '../services/gameHelper'

class Map extends EventEmitter {
  constructor () {
    super()

    this.container = new PIXI.Container()
  }

  setup (game) {
    this.game = game

    this.stars = []

    for (let i = 0; i < this.game.galaxy.stars.length; i++) {
      let star = new Star()

      star.setup(this.game.galaxy.stars[i], this.game.galaxy.players)

      this.stars.push(star)

      this.container.addChild(star.container)

      star.on('onStarClicked', this.onStarClicked.bind(this))
    }
  }

  draw () {
    this.drawStars()
  }

  drawStars () {
    for (let i = 0; i < this.stars.length - 1; i++) {
      let star = this.stars[i]

      star.draw()
    }
  }

  zoomToPlayer (game, player) {
    // Find the home star the player owns.
    let homeStar = game.galaxy.stars.find(x => {
      return x.ownedByPlayerId === player._id && x.homeStar === true
    })

    if (!homeStar) {
      return
    }

    gameContainer.viewport.fitWorld()
    gameContainer.viewport.zoom(-gameContainer.viewport.worldWidth, true)
    gameContainer.viewport.moveCenter(homeStar.location.x, homeStar.location.y)
  }

  zoomToUser (game, userId) {
    let player = GameHelper.getUserPlayer(game, userId)

    if (!player) {
      return
    }

    this.zoomToPlayer(game, player)
  }

  onStarClicked (e) {
    this.stars
      .filter(s => s.isSelected || s.data._id === e.data._id) // Get only stars that are selected or the e star.
      .forEach(s => {
        // Set all other stars to unselected.
        if (s.data._id !== e.data._id) {
          s.isSelected = false
        }

        s.draw()
      })

    this.emit('onStarClicked', e)
  }

  cleanup () {
    this.stars.forEach(s => s.removeListener('onStarClicked', this.onStarClicked))
  }
}

export default Map
