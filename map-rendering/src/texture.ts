import { Texture, TextStyle, BitmapFont, Assets } from "pixi.js";
import seededRandom from "random-seed";

export interface TextureUrls {
    CARRIER: string;
    STAR: string;
    STARLESS_NEBULA_1: string;
    STARLESS_NEBULA_2: string;
    STAR_NEBULA_1: string;
    STAR_NEBULA_2: string;
    STAR_NEBULA_3: string;
    STAR_ASTEROID_FIELD_1: string;
    STAR_ASTEROID_FIELD_2: string;
    STAR_ASTEROID_FIELD_3: string;
    STAR_WORMHOLE: string;
    CIRCLES: [string, string, string, string, string];
    HEXAGONS: [string, string, string, string, string];
    DIAMONDS: [string, string, string, string, string];
    SQUARES: [string, string, string, string, string];
    STAR_SCANNABLE: string;
    STAR_UNSCANNABLE: string;
    HOME: string;
    BLACK_HOLE: string;
    BLACK_HOLE_BINARY: string;
    BINARY_SCANNABLE: string;
    BINARY_UNSCANNABLE: string;
    SPECIALISTS: Record<string, string>;
}

const loadTextureAsset = (url: string) => {
    return Assets.load({
        src: url,
        data: {
            autoGenerateMipmaps: true,
        },
    });
};

class TextureService {
    static WARP_GATE_INDEX = 1;
    static PARTIAL_STRIDE = 2;
    static seededRNG = seededRandom.create();

    STARLESS_NEBULA_TEXTURES: Texture[] = [];
    STAR_NEBULA_TEXTURES: Texture[] = [];
    SPECIALIST_TEXTURES = {};
    PLAYER_SYMBOLS = {};
    STAR_SYMBOLS = {};

    DEFAULT_FONT_STYLE: TextStyle | undefined;
    DEFAULT_FONT_STYLE_BOLD: TextStyle | undefined;
    CARRIER_TEXTURE: Texture | undefined;
    STAR_WORMHOLE_TEXTURES: Texture[] = [];
    STAR_ASTEROID_FIELD_TEXTURES: Texture[] = [];
    STAR_TEXTURE: Texture | undefined;

    async loadAssets(urls: TextureUrls) {
        const singleUrls = Object.entries(urls).flatMap(([, val]) => {
            if (Array.isArray(val)) {
                return val as string[];
            } else if (typeof val === "string") {
                return [val];
            } else {
                // Record<string, string> (SPECIALISTS)
                return Object.values(val as Record<string, string>);
            }
        });

        await Promise.all(singleUrls.map((url) => loadTextureAsset(url)));
    }

    initialize(urls: TextureUrls) {
        this._loadPlayerSymbols(urls);
        this._loadStarSymbols(urls);

        this.CARRIER_TEXTURE = Texture.from(urls.CARRIER);
        this.DEFAULT_FONT_STYLE = new TextStyle({
            fontFamily: `Chakra Petch,sans-serif;`,
            fill: 0xffffff,
            padding: 3,
        });

        this.DEFAULT_FONT_STYLE_BOLD = new TextStyle({
            fontFamily: `Chakra Petch,sans-serif;`,
            fill: 0xffffff,
            fontWeight: "bold",
            padding: 3,
        });

        BitmapFont.install({
            name: "chakrapetch",
            style: this.DEFAULT_FONT_STYLE,
            resolution: 4,
        });

        this.STAR_TEXTURE = Texture.from(urls.STAR);

        // STARLESS NEBULAS
        this.STARLESS_NEBULA_TEXTURES.push(
            Texture.from(urls.STARLESS_NEBULA_1),
        );
        this.STARLESS_NEBULA_TEXTURES.push(
            Texture.from(urls.STARLESS_NEBULA_2),
        );

        // STAR NEBULAS
        this.STAR_NEBULA_TEXTURES.push(Texture.from(urls.STAR_NEBULA_1));
        this.STAR_NEBULA_TEXTURES.push(Texture.from(urls.STAR_NEBULA_2));
        this.STAR_NEBULA_TEXTURES.push(Texture.from(urls.STAR_NEBULA_3));

        // STAR ASTEROID FIELDS
        this.STAR_ASTEROID_FIELD_TEXTURES.push(
            Texture.from(urls.STAR_ASTEROID_FIELD_1),
        );
        this.STAR_ASTEROID_FIELD_TEXTURES.push(
            Texture.from(urls.STAR_ASTEROID_FIELD_2),
        );
        this.STAR_ASTEROID_FIELD_TEXTURES.push(
            Texture.from(urls.STAR_ASTEROID_FIELD_3),
        );

        this.STAR_WORMHOLE_TEXTURES.push(Texture.from(urls.STAR_WORMHOLE));

        for (const [name, url] of Object.entries(urls.SPECIALISTS)) {
            this._loadSpecialistTexture(name, url);
        }
    }

    _loadSpecialistTexture(name: string, url: string) {
        this.SPECIALIST_TEXTURES[name] = Texture.from(url);
        //disable mipmap
        this.SPECIALIST_TEXTURES[name].source.mipmap = 0;
    }

    getSpecialistTexture(specialistKey: string) {
        return this.SPECIALIST_TEXTURES[specialistKey];
    }

    _loadPlayerSymbols(urls: TextureUrls) {
        this.PLAYER_SYMBOLS["circle"] = urls.CIRCLES.map((u) =>
            Texture.from(u),
        );
        this.PLAYER_SYMBOLS["hexagon"] = urls.HEXAGONS.map((u) =>
            Texture.from(u),
        );
        this.PLAYER_SYMBOLS["diamond"] = urls.DIAMONDS.map((u) =>
            Texture.from(u),
        );
        this.PLAYER_SYMBOLS["square"] = urls.SQUARES.map((u) =>
            Texture.from(u),
        );
    }

    _loadStarSymbols(urls: TextureUrls) {
        this.STAR_SYMBOLS["scannable"] = Texture.from(urls.STAR_SCANNABLE);
        this.STAR_SYMBOLS["unscannable"] = Texture.from(urls.STAR_UNSCANNABLE);
        this.STAR_SYMBOLS["home"] = Texture.from(urls.HOME);
        this.STAR_SYMBOLS["black_hole"] = Texture.from(urls.BLACK_HOLE);
        this.STAR_SYMBOLS["black_hole_binary"] = Texture.from(
            urls.BLACK_HOLE_BINARY,
        );
        this.STAR_SYMBOLS["binary_scannable"] = Texture.from(
            urls.BINARY_SCANNABLE,
        );
        this.STAR_SYMBOLS["binary_unscannable"] = Texture.from(
            urls.BINARY_UNSCANNABLE,
        );
    }

    getRandomStarNebulaTexture(seed) {
        TextureService.seededRNG.seed(seed + "n");
        let index = Math.floor(
            TextureService.seededRNG.random() *
                this.STAR_NEBULA_TEXTURES.length,
        );

        return this.STAR_NEBULA_TEXTURES[index];
    }

    getRandomStarAsteroidFieldTexture(seed) {
        TextureService.seededRNG.seed(seed + "a");
        let index = Math.floor(
            TextureService.seededRNG.random() *
                this.STAR_ASTEROID_FIELD_TEXTURES.length,
        );

        return this.STAR_ASTEROID_FIELD_TEXTURES[index];
    }

    getRandomWormholeTexture() {
        // TODO: More textures?
        return this.STAR_WORMHOLE_TEXTURES[0];
    }
}

export default new TextureService();
