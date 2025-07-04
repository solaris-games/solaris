import { Container, Sprite, Graphics, BitmapText, Circle, TextStyle, Text } from 'pixi.js'
import TextureService from './texture'
import Helpers from './helpers'
import type PathManager from "./PathManager";
import type {UserGameSettings, Location} from "@solaris-common";
import type {Carrier as CarrierData, Player as PlayerData} from "../types/game";
import type Star from "./star";
import type {DrawingContext} from "./container";
import type { MapObject } from './mapObject';
import { EventEmitter } from './eventEmitter';

type CarrierClickEvent = {
  carrierData: CarrierData,
  tryMultiSelect: boolean,
  eventData: any,
}

type Events = {
  onSelected: CarrierData,
  onUnselected: CarrierData,
  onCarrierMouseOver: Carrier,
  onCarrierMouseOut: Carrier,
  onCarrierRightClicked: CarrierData,
  onCarrierClicked: CarrierClickEvent,
}

export class Carrier extends EventEmitter<keyof Events, Events> implements MapObject {
  static zoomLevel = 140

  container: Container;
  graphics_colour: Sprite | null;
  graphics_selected: Graphics;
  graphics_ship: Sprite;
  text_ships: BitmapText | null = null;
  pathManager: PathManager;
  sharedPathsIDs: Array<string>;
  uniquePaths: Array<string>;
  isMouseOver: boolean;
  zoomPercent: number;
  userSettings: UserGameSettings | undefined;
  data: CarrierData | undefined;
  stars: Star[] | undefined;
  player: PlayerData | undefined;
  context: DrawingContext | undefined;
  colour: string | undefined;
  lightYearDistance: number | undefined;
  clampedScaling: boolean | undefined;
  baseScale: number = 0;
  minScale: number = 0;
  maxScale: number = 0;
  specialistSprite: Sprite | null = null;
  isSelected: boolean = false;

  constructor ( pathManager: PathManager ) {
    super()

    this.container = new Container()
    this.container.zIndex = 1
    this.container.eventMode = 'static'
    this.container.interactiveChildren = false
    this.container.cursor = 'pointer'

    this.graphics_colour = new Sprite()
    this.graphics_selected = new Graphics()
    this.graphics_ship = new Sprite()

    this.container.addChild(this.graphics_colour)
    this.container.addChild(this.graphics_selected)
    this.container.addChild(this.graphics_ship)

    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.pathManager = pathManager
    this.sharedPathsIDs = Array()
    this.uniquePaths = Array()

    this.isMouseOver = false
    this.zoomPercent = 100
  }

    getContainer(): Container {
      return this.container!;
    }

    getLocation(): Location {
      return this.data!.location!;
    }

  setup (data, userSettings, context: DrawingContext, stars, player, lightYearDistance) {
    this.data = data
    this.stars = stars
    this.player = player
    this.context = context
    this.colour = context.getPlayerColour(player._id)
    this.lightYearDistance = lightYearDistance

    this.container.position.x = data.location.x
    this.container.position.y = data.location.y
    // Add a larger hit radius so that the star is easily clickable
    this.container.hitArea = new Circle(0, 0, 10)

    this.userSettings = userSettings

    this.clampedScaling = this.userSettings!.map.objectsScaling == 'clamped'
    this.baseScale = 1
    this.minScale = this.userSettings!.map.objectsMinimumScale/4.0
    this.maxScale = this.userSettings!.map.objectsMaximumScale/4.0

    Carrier.zoomLevel = userSettings.map.zoomLevels.carrierShips

    this.clearPaths() // clear on setup since this is used to reset waypoints
    this.enableInteractivity()
  }

  draw () {
    this.drawColour()
    this.drawSelectedCircle()
    this.drawCarrier()
    this.drawShips()
    this.drawSpecialist()
    this.drawCarrierWaypoints()
    this.drawDepth()
  }

  drawActive () {
    this.drawShips()
  }

  drawShape() {
    if (this.graphics_colour) {
      this.container.removeChild(this.graphics_colour)
      this.graphics_colour = null
    }

    if (Object.keys(TextureService.PLAYER_SYMBOLS).includes(this.player!.shape)) {
      this.graphics_colour = new Sprite(TextureService.PLAYER_SYMBOLS[this.player!.shape][4])

    }

    this.graphics_colour!.anchor.set(0.5)
    this.graphics_colour!.width = 12
    this.graphics_colour!.height = 12
    this.graphics_colour!.tint = this.colour || '#FFFFFF'

    this.container.addChild(this.graphics_colour!)
  }

  drawColour () {
    if (this.graphics_colour) {
      this.container.removeChild(this.graphics_colour)
      this.graphics_colour = null
    }

    if (!this.data!.orbiting) {
      this.drawShape();
    }
  }

  drawCarrier () {
    if (this.graphics_ship) {
      this.container.removeChild(this.graphics_ship)
    }

    this.graphics_ship = new Sprite(TextureService.CARRIER_TEXTURE)
    this.graphics_ship.anchor.set(0.5)
    this.graphics_ship.width = 10
    this.graphics_ship.height = 10
    this.container.addChild(this.graphics_ship)

    Helpers.rotateCarrierTowardsWaypoint(this.data!, this.stars!.map(s => s.data), this.graphics_ship)
  }

  drawShips () {
    if (this.text_ships) {
      this.container.removeChild(this.text_ships)
      this.text_ships = null
    }

    if (!this.text_ships) {
      let totalShips = this.data!.ships == null ? '???' : this.data!.ships

      let shipsText = totalShips.toString()

      let bitmapFont = {fontFamily: "chakrapetch", fontSize: 4}
      this.text_ships = new BitmapText({ text: shipsText, style: bitmapFont })

      this.text_ships.x = -(this.text_ships.width / 2.0)
      this.text_ships.y = 5

      this.container.addChild(this.text_ships)
      if( this.data!.isGift ) {
        let style = new TextStyle({
          fontFamily: `Chakra Petch,sans-serif;`,
          fill: 0xFFFFFF,
          padding: 3,
          fontSize: 4,
          fontWeight: 'bold'
        })
        let giftText = new Text({
          text: '🎁',
          style
        })
        giftText.resolution = 12
        giftText.position.x = this.text_ships.width
        giftText.position.y = -1
        this.text_ships.addChild(giftText)
      }
    }
  }

  drawSpecialist () {
    if (this.specialistSprite) {
      this.container.removeChild(this.specialistSprite)
      this.specialistSprite = null
    }

    if (!this.hasSpecialist() || this.data!.orbiting) {
      return
    }

    let specialistTexture = TextureService.getSpecialistTexture(this.data!.specialist!.key)
    this.specialistSprite = new Sprite(specialistTexture)
    this.specialistSprite.width = 6
    this.specialistSprite.height = 6
    this.specialistSprite.x = -3
    this.specialistSprite.y = -3

    this.container.addChild(this.specialistSprite)
  }

  hasSpecialist () {
    return this.data!.specialistId && this.data!.specialistId > 0 && this.data!.specialist
  }

  clearPaths() {
    for(let path of this.uniquePaths) {
      this.pathManager.removeUniquePath(path)
    }
    for(let pathID of this.sharedPathsIDs) {
      this.pathManager.removeSharedPath(pathID, this)
    }
    this.uniquePaths = Array()
    this.sharedPathsIDs = Array()
  }

  _isSourceLastDestination() {
    let numof_waypoints = this.data!.waypoints.length
    let lastWaypoint = this.data!.waypoints[numof_waypoints-1]
    if (numof_waypoints<2) return false;
    return (this.data!.waypoints[0].source === lastWaypoint.destination)
  }

  drawCarrierWaypoints () {
    this.clearPaths()

    const PATH_WIDTH = 0.5 * this.userSettings!.map.carrierPathWidth

    let lineWidth = this.data!.waypointsLooped ? PATH_WIDTH : PATH_WIDTH
    let lineAlpha = this.data!.waypointsLooped ? 0.3 : 0.5
    let lastPoint: Carrier | Star = this
    let sourceIsLastDestination = false
    sourceIsLastDestination = this._isSourceLastDestination()
    // if looping and source is last destination, begin drawing path from the star instead of carrier
    if ( this.data!.waypointsLooped ) {
      if (sourceIsLastDestination)  {
        lastPoint = this.stars!.find(s => s.data._id === this.data!.waypoints[0].source)!
      }
    }
    let star
    for (let i = 0; i < this.data!.waypoints.length; i++) {
      let waypoint = this.data!.waypoints[i]
      // Draw a line to each destination along the waypoints.
      star = this.stars!.find(s => s.data._id === waypoint.destination)
      if (!star) { break; }

      if ( this.data!.waypointsLooped ) {
        if (lastPoint === this) {
          this.uniquePaths.push( this.pathManager.addUniquePath( lastPoint, star, true, this.colour ) )
        }
        else {
          this.sharedPathsIDs.push( this.pathManager.addSharedPath( lastPoint, star, this ) )
        }
      }
      else {
        this.uniquePaths.push( this.pathManager.addUniquePath( lastPoint, star, false, this.colour ) )
      }

      lastPoint = star
    }
    //draw path back to the first destination
    if ( this.data!.waypointsLooped ) {
      if (!sourceIsLastDestination && this.data!.waypoints && this.data!.waypoints.length) {
        let firstPoint = this.stars!.find(s => s.data._id === this.data!.waypoints[0].destination)
        if( firstPoint && lastPoint && firstPoint !== lastPoint ) {
          this.sharedPathsIDs.push( this.pathManager.addSharedPath( star, firstPoint, this ) )
        }
      }
    }
  }

  drawSelectedCircle () {
    this.graphics_selected.clear()

    if (this.isSelected) {
      this.graphics_selected.circle(0, 0, 15)
      this.graphics_selected.stroke({
        width: 0.5,
        color: 0xFFFFFF,
        alpha: 0.3
      })
    }
  }

  drawDepth () {
    if (!this.data!.orbiting) {
      const waypoint = this.data!.waypoints[0]
      const seeds = [waypoint.source, waypoint.destination]
      const depth = Helpers.calculateDepthModifiers(this.userSettings, seeds)

      this.container.alpha = depth
      this.baseScale = depth * (this.userSettings!.map.objectsDepth === 'disabled' ? 1 : 1.5)
    } else {
      this.container.alpha = 1
    }
  }

  enableInteractivity() {
    // Can only be interactive if its in transit
    if (!this.data!.orbiting) {
      this.container.eventMode = 'static'
      this.container.cursor = 'pointer'
    } else {
      this.container.eventMode = 'passive'
      this.container.cursor = 'default'
    }
  }

  disableInteractivity() {
    this.container.eventMode = 'passive'
    this.container.cursor = 'default'
  }

  onZoomChanging(zoomPercent) {
   this.zoomPercent = zoomPercent
   this.setScale(zoomPercent)
   this.updateVisibility()//TODO see how this behaves on mobile - does it updated when pinching or only when pinching stops?
  }

  setScale( zoomPercent ) {
    if(this.clampedScaling) {
      let currentScale = zoomPercent/100
      if (currentScale < this.minScale) {
        this.container.scale.x = (1/currentScale)*this.minScale
        this.container.scale.y = (1/currentScale)*this.minScale
      } else if (currentScale > this.maxScale) {
        this.container.scale.x = (1/currentScale)*this.maxScale
        this.container.scale.y = (1/currentScale)*this.maxScale
      }
      else {
        this.container.scale.x = this.baseScale
        this.container.scale.y = this.baseScale
      }
    }
    else {
      this.container.scale.x = this.baseScale
      this.container.scale.y = this.baseScale
    }
  }

  onClicked(e, tryMultiSelect = true) {
    if (e && e.data && e.data.originalEvent && e.data.originalEvent.button === 2) {
      this.emit('onCarrierRightClicked', this.data!)
    } else {
      let eventData = e ? e.data : null

      this.emit('onCarrierClicked', {
        carrierData: this.data!,
        eventData,
        tryMultiSelect
      })

      // Need to do this otherwise sometimes text gets highlighted.
      this.deselectAllText()
    }
  }

  updateVisibility() {
    if (this.graphics_ship) this.graphics_ship.visible = !this.data!.orbiting && !this.hasSpecialist()
    if (this.text_ships) this.text_ships.visible = !this.data!.orbiting && (this.zoomPercent >= Carrier.zoomLevel || (this.isSelected && this.zoomPercent > Carrier.zoomLevel ) || (this.isMouseOver && this.zoomPercent > Carrier.zoomLevel))
  }

  deselectAllText () {
    // @ts-ignore
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    // @ts-ignore
    else if (document.selection) {document.selection.empty();}
  }

  onMouseOver (e) {
    this.isMouseOver = true

    this.emit('onCarrierMouseOver', this)
  }

  onMouseOut (e) {
    this.isMouseOver = false

    this.emit('onCarrierMouseOut', this)
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent
  }

  cleanupEventHandlers () {
    this.container.off('pointerup', this.onClicked.bind(this))
    this.container.off('mouseover', this.onMouseOver.bind(this))
    this.container.off('mouseout', this.onMouseOut.bind(this))
  }

  destroy () {
    this.container.destroy()
  }

  select () {
    this.isSelected = true
    this.drawSelectedCircle()
    this.emit('onSelected', this.data!)
    this.updateVisibility()
  }

  unselect () {
    this.isSelected = false
    this.drawSelectedCircle()
    this.emit('onUnselected', this.data!)
    this.updateVisibility()
  }

  toggleSelected () {
    if (this.isSelected) {
      this.unselect()
    } else {
      this.select()
    }
  }
}

export default Carrier
