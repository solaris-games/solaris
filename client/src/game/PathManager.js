import * as PIXI from 'pixi.js-legacy'
import gameHelper from '../services/gameHelper'

class PathManager {

  constructor ( game, userSettings,  map ) {
    this.game = game
    this.userSettings = userSettings
    this.map = map

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

    this.container = new PIXI.Container()
    this.chunklessContainer = new PIXI.Container()
    this.container.addChild(this.chunklessContainer)

    this.reloadSettings(this.userSettings)
    this.chunkSize = 512.0

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
        this.container.addChild(this.chunks[x][y])
      }
    }

  }

  reloadSettings(userSettings) {
    this.userSettings = userSettings
    this.clampedScaling = this.userSettings.map.objectsScaling == 'clamped'
    this.baseScale = 1
    this.minScale = this.userSettings.map.objectsMinimumScale/4.0
    this.maxScale = this.userSettings.map.objectsMaximumScale/4.0
  }

  addSharedPath( objectA, objectB, carrierMapObject ) {
    let mapObjects = [ objectA, objectB ]
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
    path.graphics.alpha = 0.3+path.carriers.length*0.1
    return pathID
  }

  removeSharedPath( pathID, carrier ) {
    let path = this._findPath(pathID)
    if(path) {
      let carrierIndex = path.carriers.indexOf(carrier)
      if(carrierIndex>=0) {
        path.carriers.splice(path.carriers.indexOf(carrier), 1)
      }
      path.graphics.alpha = 0.3+path.carriers.length*0.1
      if(path.carriers.length === 0) {
        this.container.removeChild(path.graphics)
        this.paths.splice(this.paths.indexOf(path), 1)
      }
    }
  }

  addUniquePath( mapObject, star, looped, colour ) {
    const PATH_WIDTH = 0.5*this.userSettings.map.carrierPathWidth
    let lineAlpha = looped ? 0.3 : 0.5
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
    this.container.removeChild( path )
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
      pathGraphics.belongsToChunk = true
    }
    else {
      this.chunklessContainer.addChild(pathGraphics)
    }
  }

  onTick( zoomPercent, viewport, zoomChanging ) {
    this.setScale( zoomPercent, viewport, zoomChanging )
  }

  setScale( zoomPercent, viewport, zoomChanging ) {
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
      for( let path of this.chunklessContainer.children) {
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
        ) {
          this.chunks[ix][iy].visible = true
          if( zoomChanging ) {
            for( let path of this.chunks[ix][iy].children ) {
              path.scale.y = yscale
            }
          }
        }
        else {
          this.chunks[ix][iy].visible = false
        }
      }
    }
  }

  _createLoopedPathGraphics( objectA, objectB, pathColour ) {
    const PATH_WIDTH = 0.5*this.userSettings.map.carrierPathWidth
    let lineAlpha = 0.3
    let lineWidth = PATH_WIDTH

    let pathGraphics
    if( this.userSettings.map.carrierLoopStyle == 'solid' ) {
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
    const DASH_LENGTH = Math.min( Math.max(1, this.userSettings.map.carrierPathDashLength), 16 )
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


    /*
    //TODO make line caps optional since they are barely visible and shit performance
    let cap1 = new PIXI.Graphics()
    cap1.beginFill(this.colour, lineAlpha)
    cap1.arc(0, 0, lineWidth, 0, Math.PI)
    cap1.endFill()
    cap1.rotation = path.rotation+Math.PI/2.0
    let cap2 = new PIXI.Graphics()
    cap2.beginFill(this.colour, lineAlpha)
    cap2.arc(0, 0, lineWidth, 0, Math.PI)
    cap2.endFill()
    cap2.rotation = path.rotation-Math.PI/2.0
    // keep a list of caps so we can remove them latter
    cap1.mapObject = objectA
    cap2.mapObject = objectB
    this.caps.push(cap1)
    this.caps.push(cap2)
    // add line caps to mapObject's container so they can inherit its scalling and be culled
    objectA.container.addChild(cap1)
    objectB.container.addChild(cap2)
    */
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
