import {Texture, TextStyle, BitmapFont, Assets} from 'pixi.js'
import seededRandom from 'random-seed'

const TEXTURE_URLS = {
  CARRIER: new URL('../assets/map-objects/128x128_carrier.svg', import.meta.url).href,
  STAR: new URL('../assets/stars/star.png', import.meta.url).href,
  STARLESS_NEBULA_1: new URL('../assets/nebula/neb0-starless.png', import.meta.url).href,
  STARLESS_NEBULA_2: new URL('../assets/nebula/neb1-starless.png', import.meta.url).href,
  STAR_NEBULA_1: new URL('../assets/nebula/star-nebula-0.png', import.meta.url).href,
  STAR_NEBULA_2: new URL('../assets/nebula/star-nebula-1.png', import.meta.url).href,
  STAR_NEBULA_3: new URL('../assets/nebula/star-nebula-2.png', import.meta.url).href,
  STAR_ASTEROID_FIELD_1: new URL('../assets/stars/star-asteroid-field-0.png', import.meta.url).href,
  STAR_ASTEROID_FIELD_2: new URL('../assets/stars/star-asteroid-field-1.png', import.meta.url).href,
  STAR_ASTEROID_FIELD_3: new URL('../assets/stars/star-asteroid-field-2.png', import.meta.url).href,
  STAR_WORMHOLE: new URL('../assets/stars/vortex.png', import.meta.url).href,
  CIRCLES: [
    new URL('../assets/map-objects/256x256_circle.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_circle_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_circle_partial.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_circle_partial_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/128x128_circle_carrier.svg', import.meta.url).href,
  ],
  HEXAGONS: [
    new URL('../assets/map-objects/256x256_hexagon.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_hexagon_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_hexagon_partial.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_hexagon_partial_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/128x128_hexagon_carrier.svg', import.meta.url).href,
  ],
  DIAMONDS: [
    new URL('../assets/map-objects/256x256_diamond.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_diamond_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_diamond_partial.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_diamond_partial_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/128x128_diamond_carrier.svg', import.meta.url).href,
  ],
  SQUARES: [
    new URL('../assets/map-objects/256x256_square.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_square_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_square_partial.svg', import.meta.url).href,
    new URL('../assets/map-objects/256x256_square_partial_warp_gate.svg', import.meta.url).href,
    new URL('../assets/map-objects/128x128_square_carrier.svg', import.meta.url).href,
  ],
  STAR_SCANNABLE: new URL('../assets/map-objects/128x128_star_scannable.svg', import.meta.url).href,
  STAR_UNSCANNABLE: new URL('../assets/map-objects/128x128_star_unscannable.svg', import.meta.url).href,
  HOME: new URL('../assets/map-objects/128x128_star_home.svg', import.meta.url).href,
  BLACK_HOLE: new URL('../assets/map-objects/128x128_star_black_hole.svg', import.meta.url).href,
  BLACK_HOLE_BINARY: new URL('../assets/map-objects/128x128_star_black_hole_binary.svg', import.meta.url).href,
  BINARY_SCANNABLE: new URL('../assets/map-objects/128x128_star_scannable_binary.svg', import.meta.url).href,
  BINARY_UNSCANNABLE: new URL('../assets/map-objects/128x128_star_unscannable_binary.svg', import.meta.url).href
}

const SPECIALIST_TEXTURES = [
  'mecha-head',
  'mecha-mask',
  'android-mask',
  'hazmat-suit',
  'cyborg-face',
  'lunar-module',
  'spaceship',
  'power-generator',
  'energise',
  'sattelite',
  'airtight-hatch',
  'cannister',
  'defense-satellite',
  'habitat-dome',
  'techno-heart',
  'missile-pod',
  'space-suit',
  'strafe',
  'ringed-planet',
  'observatory',
  'alien-stare',
  'afterburn',
  'pirate',
  'spoutnik',
  'starfighter',
  'double-ringed-orb',
  'rocket',
  'ray-gun',
  'radar-dish',
  'energy-tank',
  'cryo-chamber',
  'vintage-robot',
  'targeting',
  'rocket-thruster',
  'megabot',
  'forward-field',
  'star-gate',
  'bolter-gun'
];

const loadTextureAsset = (url: string) => {
  return Assets.load({
    src: url,
    data: {
      autoGenerateMipmaps: true
    }
  });
}

class TextureService {

  static WARP_GATE_INDEX = 1
  static PARTIAL_STRIDE = 2
  static seededRNG = seededRandom.create()

  STARLESS_NEBULA_TEXTURES: Texture[] = []
  STAR_NEBULA_TEXTURES: Texture[] = []
  SPECIALIST_TEXTURES = {}
  PLAYER_SYMBOLS = {}
  STAR_SYMBOLS = {}

  DEFAULT_FONT_STYLE: TextStyle | undefined;
  DEFAULT_FONT_STYLE_BOLD: TextStyle | undefined;
  CARRIER_TEXTURE: Texture | undefined;
  STAR_WORMHOLE_TEXTURES: Texture[] = [];
  STAR_ASTEROID_FIELD_TEXTURES: Texture[] = [];
  STAR_TEXTURE: Texture | undefined;

  async loadAssets() {
    await Promise.all(Object.keys(TEXTURE_URLS).map(spec => {
      const val = TEXTURE_URLS[spec];
      if (Array.isArray(val)) {
        return Promise.all(val.map(url => loadTextureAsset(url)));
      } else if (typeof val === 'string') {
        return loadTextureAsset(val);
      }
    }));

    await Promise.all(SPECIALIST_TEXTURES.map(specTex => loadTextureAsset(new URL(`../assets/specialists/${specTex}.svg`, import.meta.url).href)));
  }

  initialize() {
    this._loadPlayerSymbols()
    this._loadStarSymbols()

    this.CARRIER_TEXTURE = Texture.from(TEXTURE_URLS.CARRIER)
    this.DEFAULT_FONT_STYLE = new TextStyle({
      fontFamily: `Chakra Petch,sans-serif;`,
      fill: 0xFFFFFF,
      padding: 3
    })

    this.DEFAULT_FONT_STYLE_BOLD = new TextStyle({
      fontFamily: `Chakra Petch,sans-serif;`,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
      padding: 3
    })

    BitmapFont.install({
      name: 'chakrapetch',
      style: this.DEFAULT_FONT_STYLE,
      resolution: 4,
    });

    this.STAR_TEXTURE = Texture.from(TEXTURE_URLS.STAR)

    // STARLESS NEBULAS
    this.STARLESS_NEBULA_TEXTURES.push(Texture.from(TEXTURE_URLS.STARLESS_NEBULA_1))
    this.STARLESS_NEBULA_TEXTURES.push(Texture.from(TEXTURE_URLS.STARLESS_NEBULA_2))

    // STAR NEBULAS
    this.STAR_NEBULA_TEXTURES.push(Texture.from(TEXTURE_URLS.STAR_NEBULA_1))
    this.STAR_NEBULA_TEXTURES.push(Texture.from(TEXTURE_URLS.STAR_NEBULA_2))
    this.STAR_NEBULA_TEXTURES.push(Texture.from(TEXTURE_URLS.STAR_NEBULA_3))

    // STAR ASTEROID FIELDS
    this.STAR_ASTEROID_FIELD_TEXTURES.push(Texture.from(TEXTURE_URLS.STAR_ASTEROID_FIELD_1))
    this.STAR_ASTEROID_FIELD_TEXTURES.push(Texture.from(TEXTURE_URLS.STAR_ASTEROID_FIELD_2))
    this.STAR_ASTEROID_FIELD_TEXTURES.push(Texture.from(TEXTURE_URLS.STAR_ASTEROID_FIELD_3))

    this.STAR_WORMHOLE_TEXTURES.push(Texture.from(TEXTURE_URLS.STAR_WORMHOLE))

    for (let specTex of SPECIALIST_TEXTURES) {
      this._loadSpecialistTexture(specTex)
    }
  }

  _loadSpecialistTexture(name: string) {
    this.SPECIALIST_TEXTURES[name] = Texture.from(new URL(`../assets/specialists/${name}.svg`, import.meta.url).href)
    //disable mipmap
    this.SPECIALIST_TEXTURES[name].baseTexture.mipmap = 0
  }

  getSpecialistTexture(specialistKey: string) {
    return this.SPECIALIST_TEXTURES[specialistKey]
  }

  _loadPlayerSymbols() {
    this.PLAYER_SYMBOLS['circle'] = TEXTURE_URLS.CIRCLES.map(u => Texture.from(u));
    this.PLAYER_SYMBOLS['hexagon'] = TEXTURE_URLS.HEXAGONS.map(u => Texture.from(u));
    this.PLAYER_SYMBOLS['diamond'] = TEXTURE_URLS.DIAMONDS.map(u => Texture.from(u));
    this.PLAYER_SYMBOLS['square'] = TEXTURE_URLS.SQUARES.map(u => Texture.from(u));
  }

  _loadStarSymbols() {
    this.STAR_SYMBOLS['scannable'] = Texture.from(TEXTURE_URLS.STAR_SCANNABLE)
    this.STAR_SYMBOLS['unscannable'] = Texture.from(TEXTURE_URLS.STAR_UNSCANNABLE)
    this.STAR_SYMBOLS['home'] = Texture.from(TEXTURE_URLS.HOME)
    this.STAR_SYMBOLS['black_hole'] = Texture.from(TEXTURE_URLS.BLACK_HOLE)
    this.STAR_SYMBOLS['black_hole_binary'] = Texture.from(TEXTURE_URLS.BLACK_HOLE_BINARY)
    this.STAR_SYMBOLS['binary_scannable'] = Texture.from(TEXTURE_URLS.BINARY_SCANNABLE)
    this.STAR_SYMBOLS['binary_unscannable'] = Texture.from(TEXTURE_URLS.BINARY_UNSCANNABLE)
  }

  getRandomStarNebulaTexture(seed) {
    TextureService.seededRNG.seed(seed + 'n')
    let index = Math.floor(TextureService.seededRNG.random() * this.STAR_NEBULA_TEXTURES.length)

    return this.STAR_NEBULA_TEXTURES[index]
  }

  getRandomStarAsteroidFieldTexture(seed) {
    TextureService.seededRNG.seed(seed + 'a')
    let index = Math.floor(TextureService.seededRNG.random() * this.STAR_ASTEROID_FIELD_TEXTURES.length)

    return this.STAR_ASTEROID_FIELD_TEXTURES[index]
  }

  getRandomWormholeTexture() {
    // TODO: More textures?
    return this.STAR_WORMHOLE_TEXTURES[0]
  }
}

export default new TextureService()
