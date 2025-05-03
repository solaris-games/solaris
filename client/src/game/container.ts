import {Viewport} from 'pixi-viewport'
import Map from './map'
import gameHelper from '../services/gameHelper.js'
import textureService from './texture'
import type {Store} from "vuex";
import type {State} from "../store";
import {Application, isWebGLSupported, Ticker} from "pixi.js";
import type {Location, UserGameSettings} from "@solaris-common";
import type {Game, Star, Carrier} from "../types/game";
import { DebugTools } from './debugTools';
import type { EventBus } from '../eventBus';
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export class DrawingContext {
  store: Store<State>;

  constructor (store: Store<State>) {
    this.store = store;
  }

  getPlayerColour (playerId: string) {
    return this.store.getters.getColourForPlayer(playerId).value
  }
}

export const createGameContainer = async (store: Store<State>, reportGameError: ((err: string) => void), eventBus: EventBus) => {
  const userSettings = store.state.settings;
  const antialiasing = userSettings.map.antiAliasing === 'enabled';

  const options = {
    width: window.innerWidth, // window.innerWidth,
    height: window.innerHeight - 45, // window.innerHeight,
    backgroundColor: 0x000000, // black hexadecimal
    resolution: window.devicePixelRatio || 1,
    antialias: antialiasing,
    autoDensity: true,
  };

  const app = new Application();

  await app!.init(options);

  await textureService.loadAssets();
  textureService.initialize();

  return new GameContainer(store, userSettings, reportGameError, eventBus, app);
}

export class GameContainer {
  app: Application;
  map: Map;
  store: Store<State>;
  context: DrawingContext;
  viewport: Viewport;
  starFieldLeft: number = 0;
  starFieldRight: number = 0;
  starFieldTop: number = 0;
  starFieldBottom: number = 0;
  userSettings: UserGameSettings;
  game: Game;
  debugTools: DebugTools | undefined;
  eventBus: EventBus;
  unsubscribe: (() => void) | undefined;
  reportGameError: ((err: string) => void);

  constructor (store: Store<State>, userSettings: UserGameSettings, reportGameError: ((err: string) => void), eventBus: EventBus, app: Application) {
    this.store = store;
    this.eventBus = eventBus;
    this.reportGameError = reportGameError;
    this.context = new DrawingContext(store);
    this.app = app;
    this.userSettings = userSettings;

    this.app!.ticker.add(this.onTick.bind(this))
    this.app!.ticker.maxFPS = 0

    // create viewport
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,

      // yolo
      worldWidth: Number.MAX_VALUE,
      worldHeight: Number.MAX_VALUE,

      stopPropagation: true,
      passiveWheel: true,

      disableOnContextMenu: true,
      events: this.app!.renderer.events
    })

    // add the viewport to the stage
    this.app!.stage.addChild(this.viewport)

    // Add a new map to the viewport
    this.map = new Map(this.app, this.store, this, this.context!, eventBus);
    this.viewport.addChild(this.map.container)

    this.subscribe();

    this.game = store.state.game!;
    this._setupViewport();
    this.map!.setup(this.game!, userSettings)

    if (userSettings?.technical?.performanceMonitor === 'enabled') {
      this.debugTools = new DebugTools(this.app!, this.map!);
    }
  }

  checkPerformance(): { webgl: boolean, performance: boolean } {
    const webgl = isWebGLSupported(false);
    const performance = isWebGLSupported(true);

    if (!webgl) {
      return {
        webgl,
        performance: false
      };
    } else {
      return {
        webgl,
        performance
      };
    }
  }

  subscribe () {
    const onGameReload = () => this._reloadGame();
    const onStarReload = ({ star }: { star: Star }) => this._reloadStar(star);
    const onCarrierReload = ({ carrier }: { carrier: Carrier }) => this._reloadCarrier(carrier);
    const onCarrierRemove = ({ carrier }: { carrier: Carrier }) => this._undrawCarrier(carrier);
    const onFitGalaxy = ({ location }: { location?: Location }) => this._fitGalaxy(location?.x, location?.y);
    const zoomIn = () => this._zoomIn();
    const zoomOut = () => this._zoomOut();

    this.eventBus!.on(GameCommandEventBusEventNames.GameCommandReloadGame, onGameReload);
    this.eventBus!.on(GameCommandEventBusEventNames.GameCommandReloadStar, onStarReload);
    this.eventBus!.on(GameCommandEventBusEventNames.GameCommandReloadCarrier, onCarrierReload);
    this.eventBus!.on(GameCommandEventBusEventNames.GameCommandRemoveCarrier, onCarrierRemove);
    this.eventBus!.on(MapCommandEventBusEventNames.MapCommandFitGalaxy, onFitGalaxy);
    this.eventBus!.on(MapCommandEventBusEventNames.MapCommandZoomIn, zoomIn);
    this.eventBus!.on(MapCommandEventBusEventNames.MapCommandZoomOut, zoomOut);


    this.unsubscribe = () => {
      this.eventBus!.off(GameCommandEventBusEventNames.GameCommandReloadGame, onGameReload);
      this.eventBus!.off(GameCommandEventBusEventNames.GameCommandReloadStar, onStarReload);
      this.eventBus!.off(GameCommandEventBusEventNames.GameCommandReloadCarrier, onCarrierReload);
      this.eventBus!.off(GameCommandEventBusEventNames.GameCommandRemoveCarrier, onCarrierRemove);
      this.eventBus!.off(MapCommandEventBusEventNames.MapCommandFitGalaxy, onFitGalaxy);
      this.eventBus!.off(MapCommandEventBusEventNames.MapCommandZoomIn, zoomIn);
      this.eventBus!.off(MapCommandEventBusEventNames.MapCommandZoomOut, zoomOut);
    }
  }

  destroy () {
    console.warn('Destroying game container')

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }

    this.map.destroy();
    this.viewport.destroy();
    this.app.destroy(false, {
      children: true
    });
  }

  _zoomIn () {
    this.viewport!.zoomPercent(0.5, true)
  }

  _zoomOut () {
    this.viewport!.zoomPercent(-0.3, true)
  }

  _setupViewport () {
    const game = this.game;
    this.starFieldLeft = gameHelper.calculateMinStarX(game) - 1500
    this.starFieldRight = gameHelper.calculateMaxStarX(game) + 1500
    this.starFieldTop = gameHelper.calculateMinStarY(game) - 750
    this.starFieldBottom = gameHelper.calculateMaxStarY(game) + 750

    const maxWidth = 2 * Math.abs(this.starFieldLeft) + Math.abs(this.starFieldRight);
    const maxHeight = 2 * Math.abs(this.starFieldBottom) + Math.abs(this.starFieldTop);

    this.viewport!.resize(window.innerWidth, window.innerHeight, maxWidth, maxHeight)

    // activate plugins
    this.viewport!
      .drag()
      .pinch()
      .wheel({
        // percent: 2,
        smooth: 5
      })
      .decelerate({ friction: 0.9 })
      .clampZoom({
        minWidth: 50,
        minHeight: 50,
        maxWidth,
        maxHeight,
      })

    this.viewport!.on('zoomed-end', this.onViewportZoomed.bind(this))
    this.viewport!.on('pointerdown', this.map!.onViewportPointerDown.bind(this.map))
  }

  draw () {
    this.map!.draw()

    const zoomPercent = this.getViewportZoomPercentage()

    this.map!.refreshZoom(zoomPercent)

    if (this.debugTools) {
      this.debugTools.draw();
    }
  }

  _reloadGame() {
    this.reloadGame(this.store!.state.game, this.store!.state.settings);
  }

  reloadGame (game: Game, userSettings: UserGameSettings) {
    this.game = game
    this.userSettings = userSettings

    if (userSettings?.technical?.performanceMonitor === 'enabled' && !this.debugTools) {
      this.debugTools = new DebugTools(this.app!, this.map!);
      this.debugTools.draw();
    } else if (this.debugTools) {
      this.debugTools.destroy();
      this.debugTools = undefined;
    }

    this.map!.reloadGame(game, userSettings)
  }

  _reloadStar (star: Star) {
    const starObject = this.map!.setupStar(this.game!, this.userSettings!, star)
    this.map!.drawStar(starObject)
  }

  _reloadCarrier (carrier: Carrier) {
    const carrierObject = this.map!.setupCarrier(this.game, this.userSettings, carrier)
    this.map!.drawCarrier(carrierObject)
  }

  _undrawCarrier (carrier: Carrier) {
    this.map!.undrawCarrier(carrier)
  }

  getViewportZoomPercentage () {
    const viewportWidth = this.viewport!.right - this.viewport!.left
    return (this.viewport!.screenWidth / viewportWidth) * 100
  }

  onTick (ticker: Ticker) {
    if (this.map) {
      this.map.onTick(ticker.deltaTime)
    }
  }

  onViewportZoomed () {
    const zoomPercent = this.getViewportZoomPercentage()

    this.map!.refreshZoom(zoomPercent)
  }

  resize () {
    if (!this.app) {
      return;
    }

    this.app.renderer.resize(
      window.innerWidth,
      window.innerHeight
    )

    this.viewport!.resize(
      window.innerWidth,
      window.innerHeight,
      Number.MAX_VALUE,
      Number.MAX_VALUE
    )
  }

  _fitGalaxy(x: number | undefined, y: number | undefined) {
    x = x || 0;
    y = y || 0;

    this.viewport!.moveCenter(x, y)
    this.viewport!.fitWorld()
    this.viewport!.zoom(this.starFieldRight, true)
  }
}
