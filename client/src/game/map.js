import * as PIXI from 'pixi.js'
import gameContainer from './container'
import Star from './star'
import Carrier from './carrier'
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
    this.carriers = []

    // Add stars
    for (let i = 0; i < this.game.galaxy.stars.length; i++) {
      let star = new Star()

      star.setup(this.game.galaxy.stars[i], this.game.galaxy.players, this.game.galaxy.carriers)

      this.stars.push(star)

      this.container.addChild(star.container)

      star.on('onStarClicked', this.onStarClicked.bind(this))
    }

    // Add carriers
    for (let i = 0; i < this.game.galaxy.carriers.length; i++) {
      let carrier = new Carrier()

      carrier.setup(this.game.galaxy.carriers[i])

      this.carriers.push(carrier)

      this.container.addChild(carrier.container)

      carrier.on('onCarrierClicked', this.onCarrierClicked.bind(this))
    }
  }

  draw () {
    this.drawStars()
    this.drawCarriers()
  }

  drawStars () {
    for (let i = 0; i < this.stars.length; i++) {
      let star = this.stars[i]

      star.draw()
    }
  }

  drawCarriers () {
    for (let i = 0; i < this.carriers.length; i++) {
      let carrier = this.carriers[i]
      
      carrier.draw()
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

  zoomToLocation (location) {
    gameContainer.viewport.fitWorld()
    gameContainer.viewport.zoom(-gameContainer.viewport.worldWidth, true)
    gameContainer.viewport.moveCenter(location.x, location.y)
  }

  clickStar (starId) {
    let star = this.stars.find(s => s.data._id === starId)

    star.onClicked()
  }

  clickCarrier (carrierId) {
    let carrier = this.carriers.find(s => s.data._id === carrierId)

    carrier.onClicked()
  }

  unselectAllStars () {
    this.stars
    .forEach(s => {
      s.isSelected = false
      s.draw()
    })
  }

  unselectAllStarsExcept (star) {
    this.stars
      .filter(s => s.isSelected || s.data._id === star.data._id) // Get only stars that are selected or the e star.
      .forEach(s => {
        // Set all other stars to unselected.
        if (s.data._id !== star.data._id) {
          s.isSelected = false
        }

        s.draw()
      })
  }

  unselectAllCarriers () {
    // this.carriers
    // .forEach(s => {
    //   s.isSelected = false
    //   s.draw()
    // })
  }

  unselectAllCarriersExcept (carrier) {

  }

  onStarClicked (e) {
    this.unselectAllCarriers()
    this.unselectAllStarsExcept(e)

    this.emit('onStarClicked', e)
  }

  onCarrierClicked (e) {
    this.unselectAllStars()
    this.unselectAllCarriersExcept(e)

    this.emit('onCarrierClicked', e)
  }

}

export default Map
