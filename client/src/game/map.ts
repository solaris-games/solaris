import * as PIXI from 'pixi.js'
import Background from './background'
import Star from './star'
import Waypoints from './waypoints'
import RulerPoints from './rulerPoints'
import Territories from './territories'
import PlayerNames from './playerNames'
import gameHelper from '../services/gameHelper'
import AnimationService from './animation'
import PathManager from './PathManager'
import OrbitalLocationLayer from './orbital'
import WormHoleLayer from './wormHole'
import TooltipLayer from './tooltip'
import type {Store} from "vuex";
import type {State} from "../store";
import type {DrawingContext, GameContainer} from "./container";
import type {Game, Player, Star as StarData, Carrier as CarrierData} from "../types/game";
import type {Location, MapObject, UserGameSettings} from "@solaris-common";
import { Chunks } from './chunks'
import Carrier from "./carrier";
import type { EventBus } from '../eventBus'
import MapEventBusEventNames from '../eventBusEventNames/map'
import MapCommandEventBusEventNames from "../eventBusEventNames/mapCommand";

enum Mode {
  Galaxy = 'galaxy',
  Waypoints = 'waypoints',
  Ruler = 'ruler',
}

export class Map {
  // Represents the current game mode, these are as follows:
  // galaxy - Normal galaxy view
  // waypoints - Displays waypoints overlay for a given carrier
  mode = Mode.Galaxy;
  eventBus: EventBus;
  app: PIXI.Application;
  store: Store<State>;
  context: DrawingContext;
  gameContainer: GameContainer;
  container: PIXI.Container;
  stars: Star[];
  carriers: Carrier[];
  pathManager: PathManager | undefined;
  zoomPercent: number;
  lastZoomPercent: number;
  backgroundContainer: PIXI.Container | undefined;
  territoryContainer: PIXI.Container | undefined;
  playerNamesContainer: PIXI.Container | undefined;
  orbitalContainer: PIXI.Container | undefined;
  wormHoleContainer: PIXI.Container | undefined;
  starContainer: PIXI.Container | undefined;
  waypointContainer: PIXI.Container | undefined;
  rulerPointContainer: PIXI.Container | undefined;
  highlightLocationsContainer: PIXI.Container | undefined;
  tooltipContainer: PIXI.Container | undefined;
  game: Game | undefined;
  userSettings: UserGameSettings | undefined;
  waypoints: Waypoints | undefined;
  rulerPoints: RulerPoints | undefined;
  territories: Territories | undefined;
  playerNames: PlayerNames | undefined;
  background: Background | undefined;
  wormHoleLayer: WormHoleLayer | undefined;
  tooltipLayer: TooltipLayer | undefined;
  orbitalLayer: OrbitalLocationLayer | undefined;
  modeArgs: any;
  lastViewportCenter: PIXI.Point | undefined;
  currentViewportCenter: PIXI.Point | undefined;
  lastPointerDownPosition: PIXI.Point | undefined;
  chunks: Chunks | undefined;
  unsubscribe: (() => void) | undefined;

  constructor (app: PIXI.Application, store: Store<State>, gameContainer, context: DrawingContext, eventBus: EventBus) {
    this.app = app
    this.store = store
    this.context = context
    this.gameContainer = gameContainer;
    this.container = new PIXI.Container()
    this.container.sortableChildren = true
    this.eventBus = eventBus;

    this.stars = []

    this.carriers = []

    this.zoomPercent = 0

    this.zoomPercent = 100
    this.lastZoomPercent = 100
  }

  _setupContainers () {
    this.backgroundContainer = new PIXI.Container()
    this.backgroundContainer.zIndex = 0;
    this.territoryContainer = new PIXI.Container()
    this.territoryContainer.zIndex = 1;
    this.playerNamesContainer = new PIXI.Container()
    this.playerNamesContainer.zIndex = 7;
    this.orbitalContainer = new PIXI.Container()
    this.orbitalContainer.zIndex = 3;
    this.wormHoleContainer = new PIXI.Container()
    this.wormHoleContainer.zIndex = 5;
    this.starContainer = new PIXI.Container()
    this.starContainer.zIndex = 3;
    this.waypointContainer = new PIXI.Container()
    this.waypointContainer.zIndex = 8;
    this.waypointContainer.eventMode = 'none';
    this.rulerPointContainer = new PIXI.Container()
    this.rulerPointContainer.zIndex = 7;
    this.highlightLocationsContainer = new PIXI.Container()
    this.highlightLocationsContainer.zIndex = 6;
    this.tooltipContainer = new PIXI.Container()
    this.tooltipContainer.zIndex = 8;
    this.pathManager!.container.zIndex = 7;

    this.container.addChild(this.backgroundContainer)
    this.container.addChild(this.territoryContainer)
    this.container.addChild(this.wormHoleContainer)
    this.container.addChild(this.pathManager!.container)
    this.container.addChild(this.rulerPointContainer)
    this.container.addChild(this.chunks!.chunksContainer)
    this.container.addChild(this.orbitalContainer)
    this.container.addChild(this.starContainer)
    this.container.addChild(this.highlightLocationsContainer)
    this.container.addChild(this.playerNamesContainer)
    this.container.addChild(this.tooltipContainer)
    this.container.addChild(this.waypointContainer)
    this.container.sortChildren();
  }

  setup (game: Game, userSettings: UserGameSettings) {
    this.userSettings = userSettings
    this.game = game

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }

    this.app.ticker.maxFPS = userSettings.technical.fpsLimit || 60;

    this.pathManager = new PathManager( game, userSettings, this )


    // Cleanup events
    this.stars.forEach(s => s.removeAllListeners())
    this.carriers.forEach(s => s.removeAllListeners())

    this.container.removeChildren()

    this.chunks = new Chunks();

    this._setupContainers()

    // Reset the canvas
    this.stars = []
    this.carriers = []

    // Add stars
    for (let i = 0; i < game.galaxy.stars.length; i++) {
      this.setupStar(game, userSettings, game.galaxy.stars[i])
    }

    // Add carriers
    for (let i = 0; i < game.galaxy.carriers.length; i++) {
      this.setupCarrier(game, userSettings, game.galaxy.carriers[i])
    }

    // -----------
    // Setup Waypoints
    if (this.waypoints) {
      this.waypoints.removeAllListeners()
    }

    this.waypoints = new Waypoints()
    this.waypoints.setup(game, this.context)
    this.waypoints.on('onWaypointCreated', this.onWaypointCreated.bind(this))
    this.waypoints.on('onWaypointOutOfRange', this.onWaypointOutOfRange.bind(this))

    this.waypointContainer!.addChild(this.waypoints.container)

    // -----------
    // Setup Ruler Points
    if (this.rulerPoints) {
      this.rulerPoints.removeAllListeners()
    }

    this.rulerPoints = new RulerPoints()
    this.rulerPoints.setup(game)
    this.rulerPoints.on('onRulerPointCreated', this.onRulerPointCreated.bind(this))
    this.rulerPoints.on('onRulerPointsCleared', this.onRulerPointsCleared.bind(this))
    this.rulerPoints.on('onRulerPointRemoved', this.onRulerPointRemoved.bind(this))

    this.rulerPointContainer!.addChild(this.rulerPoints.container)

    // -----------
    // Setup Territories
    this.territories = new Territories()
    this.territories.setup(game, userSettings, this.context)

    this.territoryContainer!.addChild(this.territories.container)
    this.territories.draw(userSettings)

    // -----------
    // Setup Player Names
    this.playerNames = new PlayerNames()
    this.playerNames.setup(game, userSettings, this.context)

    this.playerNamesContainer!.addChild(this.playerNames.container)
    this.playerNames.draw()

    // -----------
    // Setup Background
    this.background = new Background()
    this.background.setup(game, userSettings, this.context)

    this.backgroundContainer!.addChild(this.background.container)
    this.backgroundContainer!.addChild(this.background.starContainer)
    this.background.draw()

    // -----------
    // Setup Worm Hole Paths
    if (this._isWormHolesEnabled()) {
      this.wormHoleLayer = new WormHoleLayer()
      this.drawWormHoles()
      this.wormHoleContainer!.addChild(this.wormHoleLayer.container)
    }

    // -----------
    // Setup Orbital Locations
    if (this._isOrbitalMapEnabled()) {
      this.orbitalLayer = new OrbitalLocationLayer()
      this.orbitalLayer.setup(game)

      this.orbitalContainer!.addChild(this.orbitalLayer.container)
    }

    // Setup Chunks
    this.chunks.setup(game, this.stars, this.carriers);

    this.tooltipLayer = new TooltipLayer()
    this.tooltipLayer.setup(this.game, this.context)
    this.tooltipContainer!.addChild(this.tooltipLayer.container)

    this.unsubscribe = this.subscribe();
  }

  subscribe() {
    const panToLocation = ({ location }: { location: Location }) => this.panToLocation(location);
    const panToObject = ({ object }: { object: MapObject<string> }) => this.panToObject(object);
    const panToUser = () => this.panToUser(this.game!);
    const panToPlayer = ({ player }: { player: Player }) => this.panToPlayer(this.game!, player);
    const clearHighlightedLocations = () => this.clearCarrierHighlights();
    const highlightLocation = ({ object, opacity }: { object: MapObject<string>, opacity: number }) => this.highlightLocation(object, opacity);
    const clickStar = ({ starId }: { starId: string }) => this.clickStar(starId);
    const clickCarrier = ({ carrierId }: { carrierId: string }) => this.clickCarrier(carrierId);
    const removeLastRulerWaypoint = () => this.removeLastRulerPoint();
    const showIgnoreBulkUpgrade = () => this.showIgnoreBulkUpgrade();
    const hideIgnoreBulkUpgrade = () => this.hideIgnoreBulkUpgrade();

    this.eventBus.on(MapCommandEventBusEventNames.MapCommandPanToLocation, panToLocation);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandPanToObject, panToObject);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandPanToUser, panToUser);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandPanToPlayer, panToPlayer);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandClearHighlightedLocations, clearHighlightedLocations);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandHighlightLocation, highlightLocation);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandClickStar, clickStar);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandClickCarrier, clickCarrier);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandRemoveLastRulerPoint, removeLastRulerWaypoint);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandShowIgnoreBulkUpgrade, showIgnoreBulkUpgrade);
    this.eventBus.on(MapCommandEventBusEventNames.MapCommandHideIgnoreBulkUpgrade, hideIgnoreBulkUpgrade);

    return () => {
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandPanToLocation, panToLocation);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandPanToObject, panToObject);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandPanToUser, panToUser);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandPanToPlayer, panToPlayer);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandClearHighlightedLocations, clearHighlightedLocations);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandHighlightLocation, highlightLocation);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandClickStar, clickStar);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandClickCarrier, clickCarrier);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandRemoveLastRulerPoint, removeLastRulerWaypoint);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandShowIgnoreBulkUpgrade, showIgnoreBulkUpgrade);
      this.eventBus.off(MapCommandEventBusEventNames.MapCommandHideIgnoreBulkUpgrade, hideIgnoreBulkUpgrade);
    }
  }

  setupStar (game: Game, userSettings: UserGameSettings, starData: StarData) {
    let star = this.stars.find(x => x.data._id === starData._id)

    if (!star) {
      star = new Star(this.app)
      this.stars.push(star)

      this.starContainer!.addChild(star.fixedContainer)

      star.on('onStarClicked', this.onStarClicked.bind(this))
      star.on('onStarRightClicked', this.onStarRightClicked.bind(this))
      star.on('onStarDefaultClicked', this.onStarDefaultClicked.bind(this))
      star.on('onStarMouseOver', this.onStarMouseOver.bind(this))
      star.on('onStarMouseOut', this.onStarMouseOut.bind(this))
      star.on('onSelected', this.onStarSelected.bind(this))
      star.on('onUnselected', this.onStarUnselected.bind(this))
    }

    star.setup(this.game, starData, userSettings, this.context, game.galaxy.players, game.galaxy.carriers, game.constants.distances.lightYear)

    return star
  }

  setupCarrier (game, userSettings, carrierData) {
    let carrier = this.carriers.find(x => x.data!._id === carrierData._id)

    if (!carrier) {
      carrier = new Carrier( this.pathManager! )
      this.carriers.push(carrier)

      carrier.on('onCarrierClicked', this.onCarrierClicked.bind(this))
      carrier.on('onCarrierRightClicked', this.onCarrierRightClicked.bind(this))
      carrier.on('onCarrierMouseOver', this.onCarrierMouseOver.bind(this))
      carrier.on('onCarrierMouseOut', this.onCarrierMouseOut.bind(this))
      carrier.on('onSelected', this.onCarrierSelected.bind(this))
      carrier.on('onUnselected', this.onCarrierUnselected.bind(this))
    }

    let player = gameHelper.getPlayerById(game, carrierData.ownedByPlayerId)

    carrier.setup(carrierData, userSettings, this.context, this.stars, player, game.constants.distances.lightYear)

    return carrier
  }

  draw () {
    this.drawGalaxyCenter()

    if (this.mode === 'waypoints') {
      this.drawWaypoints()
    } else {
      this.drawStars()
      this.drawCarriers()
      this.clearWaypoints()
    }

    if (this.mode === 'ruler') {
      this.drawRulerPoints()
    } else {
      this.clearRulerPoints()
    }
  }

  drawGalaxyCenter () {
    // TODO: Is there any need to display the galaxy center for non orbital games?
    if (this._isOrbitalMapEnabled() && this.game!.constants.distances.galaxyCenterLocation) {
        let galaxyCenterGraphics = new PIXI.Graphics()
        let location : Location = this.game!.constants.distances.galaxyCenterLocation
        let size = 10

        galaxyCenterGraphics.moveTo(location.x, location.y - size)
        galaxyCenterGraphics.lineTo(location.x, location.y + size)
        galaxyCenterGraphics.moveTo(location.x - size, location.y)
        galaxyCenterGraphics.lineTo(location.x + size, location.y)
        galaxyCenterGraphics.stroke({
          width: 2,
          color: 0xFFFFFF,
          alpha: 0.75,
        });

        this.starContainer!.addChild(galaxyCenterGraphics)
    }
  }

  _isOrbitalMapEnabled () {
    return this.game!.constants.distances.galaxyCenterLocation && this.game!.settings.orbitalMechanics.enabled === 'enabled'
  }

  _isWormHolesEnabled () {
    return this.game!.settings.specialGalaxy.randomWormHoles
      || this.game!.galaxy.stars.find(s => s.wormHoleToStarId)
  }

  reloadGame (game: Game, userSettings: UserGameSettings) {
    this.app.ticker.maxFPS = userSettings.technical.fpsLimit;

    this.game = game

    this.pathManager!.setup(game, userSettings)

    // Check for stars that are no longer in scanning range.
    for (let i = 0; i < this.stars.length; i++) {
      let star = this.stars[i]
      let gameStar = gameHelper.getStarById(game, star.data._id)

      if (!gameStar) {
        this._undrawStar(star)
        i--
      }
    }

    // Check for carriers that are no longer in scanning range or have been destroyed.
    for (let i = 0; i < this.carriers.length; i++) {
      let carrier = this.carriers[i]
      let gameCarrier = gameHelper.getCarrierById(game, carrier.data!._id)

      if (!gameCarrier) {
        this._undrawCarrier(carrier)
        i--
      }
    }

    // Update all of the stars and add any newly discovered ones.
    for (let i = 0; i < game.galaxy.stars.length; i++) {
      let starData = game.galaxy.stars[i]
      let existing = this.stars.find(x => x.data._id === starData._id)

      if (existing) {
        existing.setup(this.game, starData, userSettings, this.context, game.galaxy.players, game.galaxy.carriers, game.constants.distances.lightYear)
      } else {
        existing = this.setupStar(game, userSettings, starData)
      }

      this.drawStar(existing)
    }

    // Update all of the carriers and add new ones that have been built.
    for (let i = 0; i < game.galaxy.carriers.length; i++) {
      let carrierData = game.galaxy.carriers[i]

      let existing = this.carriers.find(x => x.data!._id === carrierData._id)

      if (existing) {
        let player = gameHelper.getPlayerById(game, carrierData.ownedByPlayerId!)

        existing.setup(carrierData, userSettings, this.context, this.stars, player, game.constants.distances.lightYear)
      } else {
        existing = this.setupCarrier(game, userSettings, carrierData)
      }

      this.drawCarrier(existing)
    }

    this.drawTerritories(userSettings)
    this.drawWormHoles()
    this.drawPlayerNames()

    this.background!.setup(game, userSettings, this.context)
    this.background!.draw()

    this.waypoints!.setup(game, this.context)
    this.tooltipLayer!.setup(game, this.context)

    this.chunks!.setup(game, this.stars, this.carriers);
  }


  _disableCarriersInteractivity() {
    for (let i = 0; i < this.carriers.length; i++) {
      let c = this.carriers[i]

      c.disableInteractivity()
    }
  }

  _enableCarriersInteractivity() {
    for (let i = 0; i < this.carriers.length; i++) {
      let c = this.carriers[i]

      c.enableInteractivity()
    }
  }


  setMode (mode, args) {
    let wasWaypoints = this.mode === 'waypoints'

    this.mode = mode
    this.modeArgs = args

    this.unselectAllCarriers()
    this.unselectAllStars()
    this.clearWaypoints()
    this.clearRulerPoints()

    if (this.mode === 'waypoints') {
      this._disableCarriersInteractivity()
      this.drawWaypoints()
    }

    if (wasWaypoints) {
      this._enableCarriersInteractivity()
    }

    if (this.mode === 'ruler') {
      this.drawRulerPoints()
    }
  }

  resetMode () {
    this.setMode('galaxy', this.modeArgs)
  }

  removeLastRulerPoint () {
    this.rulerPoints!.removeLastRulerPoint()
  }

  drawStars () {
    for (let i = 0; i < this.stars.length; i++) {
      let star = this.stars[i]

      this.drawStar(star)
    }
  }

  drawStar (star: Star) {
    star.draw()
    star.onZoomChanging(this.zoomPercent)
  }

  _undrawStar (star: Star) {
    star.off('onStarClicked', this.onStarClicked.bind(this))
    star.off('onStarRightClicked', this.onStarRightClicked.bind(this))

    this.starContainer!.removeChild(star.fixedContainer)

    this.chunks!.removeMapObjectFromChunks(star)

    this.stars.splice(this.stars.indexOf(star), 1)

    star.destroy()
  }

  drawCarriers () {
    for (let i = 0; i < this.carriers.length; i++) {
      let carrier = this.carriers[i]

      this.drawCarrier(carrier)
    }
  }

  drawCarrier (carrier) {
    carrier.draw()
    carrier.onZoomChanging(this.zoomPercent)
  }

  _undrawCarrier (carrier) {
    carrier.removeAllListeners()
    carrier.cleanupEventHandlers()
    carrier.clearPaths()


    this.chunks!.removeMapObjectFromChunks(carrier);

    this.carriers.splice(this.carriers.indexOf(carrier), 1)

    carrier.destroy()
  }

  undrawCarrier (carrierData) {
    let existing = this.carriers.find(x => x.data!._id === carrierData._id)

    if (existing) {
      this._undrawCarrier(existing)
    }
  }

  drawWaypoints () {
    this.waypoints!.draw(this.modeArgs)

    for (let i = 0; i < this.carriers.length; i++) {
      let c = this.carriers[i]

      c.drawCarrierWaypoints()
    }
  }

  clearWaypoints () {
    this.waypoints!.clear()
  }

  drawRulerPoints () {
    this.rulerPoints!.draw()
  }

  clearRulerPoints () {
    this.rulerPoints!.setup(this.game!)
  }

  drawTerritories (userSettings: UserGameSettings) {
    this.territories!.setup(this.game!, userSettings, this.context)
    this.territories!.draw(userSettings)
  }

  drawWormHoles () {
    if (this._isWormHolesEnabled()) {
      this.wormHoleLayer!.setup(this.game)
      this.wormHoleLayer!.draw()
    }
  }

  drawPlayerNames () {
    this.playerNames!.setup(this.game!, this.userSettings!, this.context)
    this.playerNames!.draw()
  }

  panToPlayer (game: Game, player: Player) {
    const empireCenter = gameHelper.getPlayerEmpireCenter(game, player)

    if (empireCenter) {
      this.gameContainer.viewport!.moveCenter(empireCenter.x, empireCenter.y)


      const zoomPercent = this.gameContainer.getViewportZoomPercentage()

      this.refreshZoom(zoomPercent)
    }
  }

  panToUser (game: Game) {
    let player = gameHelper.getUserPlayer(game)

    if (!player) {
      const galaxyCenterX = gameHelper.calculateGalaxyCenterX(game)
      const galaxyCenterY = gameHelper.calculateGalaxyCenterY(game)

      this.panToLocation({ x: galaxyCenterX, y: galaxyCenterY })
      return
    }

    this.panToPlayer(game, player)
  }

  panToObject(object: { location: Location }) {
    this.panToLocation(object.location)
  }

  panToStar (star: StarData) {
    this.panToLocation(star.location)
  }

  panToCarrier (carrier: CarrierData) {
    this.panToLocation(carrier.location)
  }

  panToLocation (location: Location) {
    this.gameContainer.viewport!.moveCenter(location.x, location.y)
  }

  clickStar (starId: string) {
    let star = this.stars.find(s => s.data._id === starId)

    star!.onClicked(null, false)
    star!.select()
  }

  clickCarrier (carrierId: string) {
    let carrier = this.carriers.find(s => s.data!._id === carrierId)

    carrier!.onClicked(null, false)
    carrier!.select()
  }

  unselectAllStars () {
    for (let i = 0; i < this.stars.length; i++) {
      let s = this.stars[i]

      s.unselect()
    }
  }

  unselectAllCarriers () {
    for (let i = 0; i < this.carriers.length; i++) {
      let c = this.carriers[i]

      c.unselect()
    }
    this.clearCarrierHighlights();
  }

  unselectAllStarsExcept (star) {
    this.stars
      .filter(s => s.isSelected || s.data._id === star.data._id) // Get only stars that are selected or the e star.
      .forEach(s => {
        // Set all other stars to unselected.
        if (s.data._id !== star.data._id) {
          s.unselect()
        }
      })
  }

  unselectAllCarriersExcept (carrier) {
    this.carriers
      .filter(c => c.isSelected || c.data!._id === carrier.data._id) // Get only stars that are selected or the e star.
      .forEach(c => {
        // Set all other carriers to unselected.
        if (c.data!._id !== carrier.data._id) {
          c.unselect()
        }
      })
      this.clearCarrierHighlights();
  }

  clearCarrierHighlights() {
    this.waypoints!.clear();
  }

  onTick(deltaTime) {
    const viewportWidth = this.gameContainer.viewport!.right - this.gameContainer.viewport!.left
    const viewportHeight = this.gameContainer.viewport!.bottom - this.gameContainer.viewport!.top

    const viewportXRadius = viewportWidth / 2.0
    const viewportYRadius = viewportHeight / 2.0

    const viewportCenter = this.gameContainer.viewport!.center

    this.lastViewportCenter = this.currentViewportCenter || undefined;
    this.currentViewportCenter = this.gameContainer.viewport!.center

    this.zoomPercent = (this.gameContainer.viewport!.screenWidth/viewportWidth) * 100

    const viewportData = {
      center: viewportCenter,
      xradius: viewportXRadius,
      yradius: viewportYRadius
    }

    this.background!.onTick(deltaTime, viewportData)

    //chunk culling

    const positionChanging = this.lastViewportCenter == null || this.currentViewportCenter.x !== this.lastViewportCenter.x || this.currentViewportCenter.y !== this.lastViewportCenter.y
    const zoomChanging = Math.abs(this.zoomPercent-this.lastZoomPercent) > (1.0/128.0)

    this.chunks!.onTick(positionChanging, zoomChanging, this.zoomPercent, {
      left: this.gameContainer.viewport!.left,
      right: this.gameContainer.viewport!.right,
      top: this.gameContainer.viewport!.top,
      bottom: this.gameContainer.viewport!.bottom,
    });

    this.pathManager!.onTick(this.zoomPercent, this.gameContainer.viewport, zoomChanging)
    this.playerNames!.onTick(this.zoomPercent, zoomChanging)

    this.lastZoomPercent = this.zoomPercent
  }

  onViewportPointerDown(e) {
    //need Object.assign, wich is weird since pixie says it creates a new point each time
    this.lastPointerDownPosition = Object.assign({}, e.data.global)
  }

  //not sure where to put this func
  isDragMotion(position) {
    let DRAG_THRESHOLD = 8 //max distance in pixels
    let dxSquared = Math.pow(Math.abs(this.lastPointerDownPosition!.x - position.x),2)
    let dySquared = Math.pow(Math.abs(this.lastPointerDownPosition!.y - position.y),2)
    let distance = Math.sqrt(dxSquared+dySquared)

    return (distance > DRAG_THRESHOLD)
  }

  onStarClicked (dic) {
    // ignore clicks if its a drag motion
    let e = dic.starData
    if (dic.eventData && this.isDragMotion(dic.eventData.global)) { return }

    // dispatch click event to the store, so it can be intercepted for adding star name to open message
    this.store.commit('starClicked', {
      star: dic.starData,
      permitCallback: () => {
        dic.permitCallback && dic.permitCallback()

        this.selectStar(e, dic);
      }
    })
  }

  selectStar (e, dic) {
    // Clicking stars should only raise events to the UI if in galaxy mode.
    if (this.mode === 'galaxy') {
      let selectedStar = this.stars.find(x => x.data._id === e._id)

      this.unselectAllCarriers()
      this.unselectAllStarsExcept(selectedStar)

      if (!dic.tryMultiSelect || !this.tryMultiSelect(e.location)) {
        selectedStar!.toggleSelected()
        this.eventBus.emit(MapEventBusEventNames.MapOnStarClicked, { star: e })
      }
    } else if (this.mode === 'waypoints') {
      this.waypoints!.onStarClicked(e)
    } else if (this.mode === 'ruler') {
      this.rulerPoints!.onStarClicked(e)
    }
    AnimationService.drawSelectedCircle(this.app, this.container, e.location)
  }

  onStarDefaultClicked (dic) {
    // ignore clicks if its a drag motion
    let e = dic.starData
    if (dic.eventData && this.isDragMotion(dic.eventData.global)) { return }

    dic.permitCallback && dic.permitCallback()
    this.selectStar(e, dic);
  }

  onStarRightClicked (dic) {
    // ignore clicks if its a drag motion
    let e = dic.starData
    if (dic.eventData && this.isDragMotion(dic.eventData.global)) { return }

    let owningPlayer = gameHelper.getStarOwningPlayer(this.game, dic.starData)

    // dispatch click event to the store, so it can be intercepted for adding star/player name to open message
    this.store.commit('starRightClicked', {
      star: dic.starData,
      player: owningPlayer,
      permitCallback: () => {
        dic.permitCallback && dic.permitCallback()

        if (this.mode === 'galaxy') {
          this.eventBus.emit(MapEventBusEventNames.MapOnStarRightClicked, { star: e })
        }
      }
    })
  }

  onCarrierClicked (dic) {
    // ignore clicks if its a drag motion
    if (dic.eventData && this.isDragMotion(dic.eventData.global)) { return }

    let e = dic.carrierData
    // Clicking carriers should only raise events to the UI if in galaxy mode.
    if (this.mode === 'galaxy') {

      let selectedCarrier = this.carriers.find(x => x.data!._id === e._id)

      this.unselectAllStars()
      this.unselectAllCarriersExcept(selectedCarrier)

      selectedCarrier!.toggleSelected()

      //highlight carrier path if selected
      if (selectedCarrier?.isSelected) {
        this.waypoints!.draw(selectedCarrier!.data, false);
      }
      else {
        this.waypoints!.clear();
      }

      if (!dic.tryMultiSelect || !this.tryMultiSelect(e.location)) {
        this.eventBus.emit(MapEventBusEventNames.MapOnCarrierClicked, { carrier: e })
      } else {
        selectedCarrier!.unselect()
      }
    } else if (this.mode === 'ruler') {
      this.rulerPoints!.onCarrierClicked(e)
    }

    AnimationService.drawSelectedCircle(this.app, this.container, e.location)
  }

  onCarrierRightClicked (e) {
    if (this.mode === 'galaxy') {
      this.eventBus.emit(MapEventBusEventNames.MapOnCarrierRightClicked, { carrier: e });
    }
  }

  onCarrierMouseOver (e) {
    // If the carrier is orbiting something then send the mouse over event
    // to the star.
    if (e.data.orbiting) {
      let star = this.stars.find(s => s.data._id === e.data.orbiting)
      star!.onMouseOver(undefined)
    }

    this.tooltipLayer!.drawTooltipCarrier(e.data)
  }

  onCarrierMouseOut (e) {
    // If the carrier is orbiting something then send the mouse over event
    // to the star.
    if (e.data.orbiting) {
      let star = this.stars.find(s => s.data._id === e.data.orbiting)
      star!.onMouseOut(undefined)
    }

    this.tooltipLayer!.clear()
  }

  onStarMouseOver (e) {
    this.tooltipLayer!.drawTooltipStar(e.data)
  }

  onStarMouseOut (e) {
    this.tooltipLayer!.clear()
  }

  onWaypointCreated (e) {
    this.eventBus.emit(MapEventBusEventNames.MapOnWaypointCreated, { waypoint: e })
  }

  onWaypointOutOfRange (e) {
    this.eventBus.emit(MapEventBusEventNames.MapOnWaypointOutOfRange)
  }

  onRulerPointCreated (e) {
    console.log(e);

    this.eventBus.emit(MapEventBusEventNames.MapOnRulerPointCreated, { rulerPoint: e });
  }

  onRulerPointRemoved (e) {
    this.eventBus.emit(MapEventBusEventNames.MapOnRulerPointRemoved, { rulerPoint: e });
  }

  onRulerPointsCleared (e) {
    this.eventBus.emit(MapEventBusEventNames.MapOnRulerPointsCleared);
  }

  tryMultiSelect (location) {
    // See if there are any other objects close by, if so then
    // we want to allow the user to select which one they want as there might be
    // objects on the map that are on top of eachother or very close together.
    const distance = 10

    let closeStars: {
      type: string;
      distance: number;
      ref: any;
      data: any;
    }[] = this.stars
      .map(s => {
        return {
          ref: s,
          type: 'star',
          distance: gameHelper.getDistanceBetweenLocations(location, s.data.location),
          data: s.data,
        }
      })
      .filter(s => s.distance <= distance)

    let closeCarriers = this.carriers
      .map(s => {
        return {
          ref: s,
          type: 'carrier',
          distance: gameHelper.getDistanceBetweenLocations(location, s.data!.location),
          data: s.data
        }
      })
      .filter(s => s.distance <= distance)

    // Combine the arrays and order by closest first.
    let closeObjects = closeStars.concat(closeCarriers)
      .sort((a, b) => {
        if (a.type !== b.type) { // Sort stars first
          return b.type.localeCompare(a.type);
        }

        if (a.distance === b.distance) {
          return a.data!.name.localeCompare(b.data!.name); // If the distances are identical, sort by name ascending.
        }

        return a.distance < b.distance ? -1 : 1; // Finally, sort by distance ascending.
      });

    if (closeObjects.length > 1) {
      let star = closeObjects.find(co => co.type === 'star')

      if (star) {
        star.ref.toggleSelected() // Select to star to get the ranges drawn on the map
      }

      let eventObj = closeObjects.map(co => {
        return {
          type: co.type,
          data: co.data,
          distance: co.distance
        }
      })

      this.eventBus.emit(MapEventBusEventNames.MapOnObjectsClicked, {
        objects: eventObj
      })

      return true
    }

    return false
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent

    this.stars.forEach(s => s.refreshZoom(zoomPercent))
    this.carriers.forEach(c => c.refreshZoom(zoomPercent))

    if (this.territories) this.territories.refreshZoom(zoomPercent)
    if (this.playerNames) this.playerNames.refreshZoom(zoomPercent)
    if (this.background) this.background.refreshZoom(zoomPercent)
  }

  highlightLocation (location, opacity = 1) {
    let graphics = new PIXI.Graphics()
    let radius = 12

    graphics.star(location.x, location.y, radius, radius, radius - 3)
    graphics.stroke({
      width: 1,
      color: 0xFFFFFF,
      alpha: opacity,
    });

    this.highlightLocationsContainer!.addChild(graphics)
  }

  clearHighlightedLocations () {
    this.highlightLocationsContainer!.removeChildren()
  }

  showIgnoreBulkUpgrade () {
    for (let star of this.stars) {
      star.showIgnoreBulkUpgrade()
    }
  }

  hideIgnoreBulkUpgrade () {
    for (let star of this.stars) {
      star.hideIgnoreBulkUpgrade()
    }
  }

  onStarSelected (e) {
    if (this._isOrbitalMapEnabled()) {
      this.orbitalLayer!.drawStar(e)
    }
  }

  onStarUnselected (e) {
    if (this._isOrbitalMapEnabled()) {
      this.orbitalLayer!.clear()
    }
  }

  onCarrierSelected (e) {
    if (this._isOrbitalMapEnabled()) {
      this.orbitalLayer!.drawCarrier(e)
    }
  }

  onCarrierUnselected (e) {
    if (this._isOrbitalMapEnabled()) {
      this.orbitalLayer!.clear()
    }
  }
}

export default Map
