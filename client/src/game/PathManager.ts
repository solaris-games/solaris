import * as PIXI from 'pixi.js'
import gameHelper from '../services/gameHelper'
import helpers from './helpers'
import type { Map } from './map';
import type {UserGameSettings} from "@solaris-common";
import type {Game} from "../types/game";
import type Carrier from "./carrier";

interface GraphicsWithChunk extends PIXI.Graphics {
  chunk: PIXI.Container,
}

type Path = {
  id: string,
  carriers: Carrier[],
  graphics: GraphicsWithChunk,
}

export class PathManager {
  map: Map;
  zoomPercent: number;
  container: PIXI.Container;
  chunkSize: number;
  game: Game | undefined;
  userSettings: UserGameSettings | undefined;
  paths: Path[] = [];
  chunklessContainer: PIXI.Container | undefined;
  chunksContainer: PIXI.Container | undefined;
  firstChunkX: number = 0;
  firstChunkY: number = 0;
  lastChunkX: number = 0;
  lastChunkY: number = 0;
  chunksXlen: number = 0;
  chunksYlen: number = 0;
  chunks: PIXI.Container[][] = [];
  clampedScaling: boolean = false;
  baseScale: number = 1;
  minScale: number = 0;
  maxScale: number = 0;

  constructor ( game: Game, userSettings: UserGameSettings,  map: Map) {
    this.map = map

    this.zoomPercent = 100

    this.container = new PIXI.Container()

    this.chunkSize = 512.0

    this.setup(game, userSettings)
  }

  setup(game: Game, userSettings: UserGameSettings) {

    this.game = game
    this.userSettings = userSettings
    this._loadSettings()

    this.paths = Array()
    /*
     * each managed path is the following dictionary:
     * {
     *  id = string
     *  carriers: array of carrier mapObject
     *  graphics: PIXI.Graphics
     * }
     *
    */
    if( this.chunklessContainer ) {
      this.container.removeChild(this.chunklessContainer)
    }
    if( this.chunksContainer ) {
      this.container.removeChild(this.chunksContainer)
    }

    this.chunksContainer = new PIXI.Container()
    this.chunklessContainer = new PIXI.Container()
    this.container.addChild(this.chunklessContainer)
    this.container.addChild(this.chunksContainer)

    let minX = gameHelper.calculateMinStarX(this.game)
    let minY = gameHelper.calculateMinStarY(this.game)
    let maxX = gameHelper.calculateMaxStarX(this.game)
    let maxY = gameHelper.calculateMaxStarY(this.game)

    this.firstChunkX = Math.floor(minX/this.chunkSize)
    this.firstChunkY = Math.floor(minY/this.chunkSize)
    this.lastChunkX = Math.floor(maxX/this.chunkSize)
    this.lastChunkY = Math.floor(maxY/this.chunkSize)

    this.chunksXlen = (this.lastChunkX-this.firstChunkX)+1
    this.chunksYlen = (this.lastChunkY-this.firstChunkY)+1

    this.chunks = Array(this.chunksXlen)
    for(let x=0; x<this.chunksXlen; x+=1) {
      this.chunks[x] = Array(this.chunksYlen)
      for(let y=0; y<this.chunksYlen; y+=1) {
        this.chunks[x][y] = new PIXI.Container()
        this.chunksContainer.addChild(this.chunks[x][y])
      }
    }

  }

  _loadSettings() {
    this.clampedScaling = this.userSettings!.map.objectsScaling == 'clamped'
    this.baseScale = 1
    this.minScale = this.userSettings!.map.objectsMinimumScale/4.0
    this.maxScale = this.userSettings!.map.objectsMaximumScale/4.0
  }

  addSharedPath( objectA, objectB, carrierMapObject ) {
    let mapObjects = [ objectA, objectB ]
    let objectAlpha = helpers.calculateDepthModifiers(this.userSettings, [objectA._id, objectB._id])/2

    this._orderObjects(mapObjects)

    let pathID = mapObjects[0].data._id + mapObjects[1].data._id
    let path = this._findPath(pathID)
    if(!path) {
      path = {
        id: pathID,
        carriers: Array(),
        graphics: this._createLoopedPathGraphics( mapObjects[0], mapObjects[1], carrierMapObject.colour )
      }
      this.paths.push(path)
    }
    if( !this._pathContainsCarrier(carrierMapObject, path) ) {
      path.carriers.push(carrierMapObject)
    }

    path.graphics.alpha = objectAlpha+path.carriers.length*0.1
    return pathID
  }

  removeSharedPath( pathID, carrier ) {
    let path = this._findPath(pathID)
    if(path) {
      let pathGraphics = path.graphics
      let carrierIndex = path.carriers.indexOf(carrier)
      if(carrierIndex>=0) {
        path.carriers.splice(path.carriers.indexOf(carrier), 1)
      }
      path.graphics.alpha = (helpers.calculateDepthModifier(this.userSettings, carrier._id)/2)+path.carriers.length*0.1
      if(path.carriers.length === 0) {
        if(pathGraphics.chunk) {
          pathGraphics.chunk.removeChild(pathGraphics)
        }
        else {
          this.chunklessContainer!.removeChild( pathGraphics )
        }
        this.paths.splice(this.paths.indexOf(path), 1)
      }
    }
  }

  addUniquePath( mapObject, star, looped, colour ) {
    const PATH_WIDTH = 0.5*this.userSettings!.map.carrierPathWidth
    let objectAlpha = helpers.calculateDepthModifier(this.userSettings, mapObject._id)/2
    let lineAlpha = looped ? objectAlpha / 2 : objectAlpha
    let lineWidth = PATH_WIDTH
    let path
    if(looped) {
      path = this._createLoopedPathGraphics( mapObject, star, colour )
    }
    else{
      path = this._createSolidPathGraphics( lineAlpha, lineWidth, mapObject, star, colour )
    }
    path.alpha = lineAlpha
    return path
  }

  removeUniquePath( path ) {
    if(path.chunk) {
      path.chunk.removeChild(path)
    }
    else {
      this.chunklessContainer!.removeChild( path )
    }
  }

  addPathToChunk(pathGraphics, locA, locB) {
    let chunkXA = Math.floor(locA.x/this.chunkSize)
    let chunkYA = Math.floor(locA.y/this.chunkSize)
    let chunkXB = Math.floor(locB.x/this.chunkSize)
    let chunkYB = Math.floor(locB.y/this.chunkSize)

    if( (chunkXA === chunkXB) && (chunkYA === chunkYB) ) {
      let ix = chunkXA-this.firstChunkX
      let iy = chunkYA-this.firstChunkY

      this.chunks[ix][iy].addChild(pathGraphics)
      pathGraphics.chunk = this.chunks[ix][iy]
    }
    else {
      this.chunklessContainer!.addChild(pathGraphics)
    }
    this._updatePathScale(pathGraphics)
  }

  onTick( zoomPercent: number, viewport, zoomChanging: boolean ) {
    this.setScale( zoomPercent, viewport, zoomChanging )
    this.zoomPercent = zoomPercent
  }

  setScale( zoomPercent: number, viewport, zoomChanging: boolean ) {
    let yscale = this.baseScale
    if(this.clampedScaling) {
      let currentScale = zoomPercent/100
      if (currentScale < this.minScale) {
        yscale = (1/currentScale)*this.minScale
      } else if (currentScale > this.maxScale) {
        yscale = (1/currentScale)*this.maxScale
      }
    }

    if( zoomChanging ) {
      for( let path of this.chunklessContainer!.children) {
        path.scale.y = yscale
      }
    }

    //chunk culling
    let firstX = Math.floor(viewport.left/this.chunkSize)
    let firstY = Math.floor(viewport.top/this.chunkSize)

    let lastX = Math.floor(viewport.right/this.chunkSize)
    let lastY = Math.floor(viewport.bottom/this.chunkSize)

    for(let ix=0; ix<this.chunksXlen; ix+=1) {
      for(let iy=0; iy<this.chunksYlen; iy+=1) {
        if(
        (ix>=(firstX-this.firstChunkX))&&(ix<=(lastX-this.firstChunkX)) &&
        (iy>=(firstY-this.firstChunkY))&&(iy<=(lastY-this.firstChunkY))
        )
        {
          if( !this.chunks[ix][iy].visible ) {
            this.chunks[ix][iy].visible = true
            for( let path of this.chunks[ix][iy].children ) {
              path.scale.y = yscale
            }
          }
          else {
            if( zoomChanging ) {
              for( let path of this.chunks[ix][iy].children ) {
                path.scale.y = yscale
              }
            }
          }
        }
        else {
          this.chunks[ix][iy].visible = false
        }
      }
    }
  }

  _updatePathScale(path) {
    let yscale = this.baseScale
    if(this.clampedScaling) {
      let currentScale = this.zoomPercent/100
      if (currentScale < this.minScale) {
        yscale = (1/currentScale)*this.minScale
      } else if (currentScale > this.maxScale) {
        yscale = (1/currentScale)*this.maxScale
      }
    }
    path.scale.y = yscale
  }

  _createLoopedPathGraphics( objectA, objectB, pathColour ) {
    const PATH_WIDTH = 0.5*this.userSettings!.map.carrierPathWidth
    let lineAlpha = 0.3
    let lineWidth = PATH_WIDTH

    let pathGraphics
    if( this.userSettings!.map.carrierLoopStyle == 'solid' ) {
      pathGraphics = this._createSolidPathGraphics( lineAlpha, lineWidth/3.0, objectA, objectB, pathColour )
    }
    else {
      pathGraphics = this._createDashedPathGraphics( lineAlpha, lineWidth, objectA, objectB, pathColour )
    }
    return pathGraphics
  }

  _createDashedPathGraphics( lineAlpha, lineWidth, objectA, objectB, pathColour ) {
    let pointA = objectA.data.location
    let pointB = objectB.data.location
    const DASH_LENGTH = Math.min( Math.max(1, this.userSettings!.map.carrierPathDashLength), 16 )
    const VOID_LENGTH = DASH_LENGTH/2.0
    const COMBINED_LENGTH = DASH_LENGTH+VOID_LENGTH

    let pathLength = gameHelper.getDistanceBetweenLocations(pointA,pointB)

    let dashCount = Math.floor( pathLength/(DASH_LENGTH+VOID_LENGTH) )
    let endpointsLength =  pathLength - (dashCount*(DASH_LENGTH+VOID_LENGTH))

    let initialX = (endpointsLength/2.0)+(VOID_LENGTH/2.0)
    let path = new PIXI.Graphics()

    path.moveTo(0, lineWidth)
    path.beginFill(pathColour)
    path.lineTo(0, -lineWidth)
    path.lineTo(Math.max(initialX-VOID_LENGTH,0), -lineWidth)
    path.lineTo(Math.max(initialX-VOID_LENGTH,0), lineWidth)
    path.endFill()

    for( let i = 0; i<dashCount; i++ ) {
      path.moveTo(initialX+(i*COMBINED_LENGTH), lineWidth)
      path.beginFill(pathColour)
      path.lineTo(initialX+(i*COMBINED_LENGTH), -lineWidth)
      path.lineTo(initialX+(i*COMBINED_LENGTH)+DASH_LENGTH, -lineWidth)
      path.lineTo(initialX+(i*COMBINED_LENGTH)+DASH_LENGTH, lineWidth)
      path.endFill()
    }

    path.moveTo(Math.min(initialX+(dashCount*COMBINED_LENGTH),pathLength), lineWidth)
    path.beginFill(pathColour)
    path.lineTo(Math.min(initialX+(dashCount*COMBINED_LENGTH),pathLength), -lineWidth)
    path.lineTo(pathLength, -lineWidth)
    path.lineTo(pathLength, lineWidth)
    path.endFill()

    path.rotation = Math.atan2(pointB.y-pointA.y,pointB.x-pointA.x)
    path.position = pointA

    this.addPathToChunk(path, pointA, pointB)
    return path
  }

  _createSolidPathGraphics( lineAlpha, lineWidth, objectA, objectB, pathColour ) {
    let pointA = objectA.data.location
    let pointB = objectB.data.location
    let pathLength = gameHelper.getDistanceBetweenLocations(pointA,pointB)

    let path = new PIXI.Graphics()
    path.beginFill(pathColour)
    path.moveTo(0, lineWidth)
    path.lineTo(0, -lineWidth)
    path.lineTo(pathLength, -lineWidth)
    path.lineTo(pathLength, lineWidth)
    path.endFill()
    path.rotation = Math.atan2(pointB.y-pointA.y,pointB.x-pointA.x)
    path.position = pointA

    this.addPathToChunk(path, pointA, pointB)
    return path
  }

  _orderObjects(mapObjects) {
    if( mapObjects[1].data._id > mapObjects[0].data._id ) {
      let firstMapObject = mapObjects[0]
      mapObjects[0] = mapObjects[1]
      mapObjects[1] = firstMapObject
    }
  }

  _pathContainsCarrier(carrierMapObject, path) {
    let carrier = path.carriers.find( c => c.data._id === carrierMapObject.data._id )
    return carrier
  }

  _findPath( pathID ) {
    let path = this.paths.find( p => p.id === pathID )
    return path
  }

}

export default PathManager
