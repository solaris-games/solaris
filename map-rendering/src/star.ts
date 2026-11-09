import {
    Application,
    BitmapText,
    Circle,
    Container,
    Graphics,
    Sprite,
    FederatedPointerEvent,
    Ticker,
} from "pixi.js";
import TextureService from "./texture";
import seededRandom from "random-seed";
import Helpers from "./helpers";
import { type MapObject } from "./mapObject";
import type { Game, Star as StarData } from "./types/game";
import {
    type Location,
    type NaturalResources,
    StarDataService,
    type UserGameSettings,
} from "@solaris/common";
import type { DrawingContext } from "./container";
import { EventEmitter } from "./eventEmitter";
import helpers from "./helpers";
import { Planets } from "./planets";

const NAME_SIZE = 4;

const CULLING_MARGIN = 16;
const SHIPS_SMALL_SIZE = 6;
const SHIPS_BIG_SIZE = 10;
const MAX_LOD = 4;

export type BasicStarClickEvent = {
    eventData?: FederatedPointerEvent;
    starData: StarData;
    tryMultiSelect: boolean;
};

export type StarClickEvent = BasicStarClickEvent & {
    permitCallback: () => void;
};

type Events = {
    onSelected: StarData;
    onUnselected: StarData;
    onStarMouseOver: StarData;
    onStarMouseOut: StarData;
    onStarRightClicked: BasicStarClickEvent;
    onStarDefaultClicked: BasicStarClickEvent;
    onStarClicked: StarClickEvent;
};

export class Star
    extends EventEmitter<keyof Events, Events>
    implements MapObject
{
    static seededRNG = seededRandom.create();

    app: Application;
    container: Container;
    shapePartGraphics: Sprite;
    shapeFullGraphics: Sprite;
    naturalResourcesRingGraphics: Graphics[];
    starGraphics: Sprite;
    targetedGraphics: Graphics;
    selectedGraphics: Graphics;
    kingOfTheHillGraphics: Graphics;
    isSelected: boolean;
    isMouseOver: boolean;
    zoomPercent: number;
    showIgnoreBulkUpgradeInfrastructure: boolean;
    zoomDepth: number;
    game: Game;
    data: StarData;
    context: DrawingContext;
    userSettings: UserGameSettings;
    planets: Planets;
    pulsarGraphics: Graphics | null = null;
    nebulaSprite: Sprite | null = null;
    wormHoleSprite: Sprite | null = null;
    asteroidFieldSprite: Sprite | null = null;
    specialistSprite: Sprite | null = null;
    nameText: BitmapText | null = null;
    shipsSmallText: BitmapText | null = null;
    shipsBigText: BitmapText | null = null;
    infrastructureText: BitmapText | null = null;
    infrastructureBulkIgnoredText: BitmapText | null = null;
    starDataService: StarDataService;

    constructor(
        starDataService: StarDataService,
        app: Application,
        game: Game,
        data: StarData,
        userSettings: UserGameSettings,
        context: DrawingContext,
    ) {
        super();

        this.starDataService = starDataService;

        this.game = game;
        this.data = data;
        this.context = context;
        this.userSettings = userSettings;

        this.app = app;
        this.container = new Container();
        this.container.zIndex = 0;
        this.container.interactiveChildren = false;
        this.container.cursor = "pointer";
        this.container.eventMode = "static";

        this.planets = new Planets(app, userSettings, context, game, data);
        this.starGraphics = new Sprite();
        this.shapePartGraphics = new Sprite();
        this.shapeFullGraphics = new Sprite();
        this.naturalResourcesRingGraphics = new Array(MAX_LOD);
        this.targetedGraphics = new Graphics();
        this.selectedGraphics = new Graphics();
        this.kingOfTheHillGraphics = new Graphics();

        this.container.addChild(this.starGraphics);
        this.container.addChild(this.shapePartGraphics);
        this.container.addChild(this.shapeFullGraphics);
        this.container.addChild(this.targetedGraphics);
        this.container.addChild(this.selectedGraphics);
        this.container.addChild(this.kingOfTheHillGraphics);
        this.container.addChild(this.planets.container);

        this.container.on("pointerup", this.onClicked.bind(this));
        this.container.on("mouseover", this.onMouseOver.bind(this));
        this.container.on("mouseout", this.onMouseOut.bind(this));

        this.isSelected = false;
        this.isMouseOver = false;
        this.zoomPercent = 100;
        this.showIgnoreBulkUpgradeInfrastructure = false;
        /**
      Zoomdepth
      I'd make this an enum if I could...

      This is a value ranging from 1 to 4
      1: Display stars only
      2: Display shipcounts and orbit
      3: Display shipcount, orbit and name
      4: Display shipcount, orbit, name and infrastructure

      What zoompercentage corresponds with what depth level
      can be read from static property "zoomLevelDefinitions"
    */
        this.zoomDepth = 1;

        this.update(game, data, userSettings);
    }

    getContainer(): Container {
        return this.container!;
    }

    getLocation(): Location {
        return this.data!.location!;
    }

    _getStarPlayer() {
        return this.game.galaxy.players.find(
            (x) => x._id === this.data.ownedByPlayerId,
        );
    }

    _getStarCarriers() {
        return this.game.galaxy.carriers.filter(
            (x) => x.orbiting === this.data._id,
        );
    }

    _getStarCarrierShips() {
        return this._getStarCarriers().reduce(
            (sum, c) => sum + (c.ships || 0),
            0,
        );
    }

    update(game: Game, data: StarData, userSettings: UserGameSettings) {
        this.game = game;
        this.data = data;
        this.container.position.x = this.data.location.x;
        this.container.position.y = this.data.location.y;
        this.container.hitArea = new Circle(0, 0, 15);

        this.userSettings = userSettings;
    }

    draw() {
        // Note: The star may become visible/hidden due to changing scanning range.
        // If a star is revealed or a star becomes masked then we want to  the entire
        // star to be re-drawn.

        this.drawKingOfTheHillCircle();
        this.drawWormHole();
        this.drawPulsar();
        this.drawNebula();
        this.drawAsteroidField();
        this.drawTarget();
        this.drawSelectedCircle();
        this.drawStar();
        this.drawSpecialist();
        this.drawPlanets();
        this.drawNaturalResourcesRing();
        this.drawColour();
        this.drawName();
        this.drawShips();
        this.drawInfrastructure();
        this.drawInfrastructureBulkIgnored();
    }

    drawStar() {
        this.container.removeChild(this.starGraphics);

        if (this.data.isInScanningRange) {
            // ---- Binary stars ----
            if (this.isBinaryStar()) {
                if (this.hasBlackHole()) {
                    this.starGraphics = new Sprite(
                        TextureService.STAR_SYMBOLS["black_hole_binary"],
                    );
                } else if (this._isDeadStar()) {
                    this.starGraphics = new Sprite(
                        TextureService.STAR_SYMBOLS["binary_unscannable"],
                    );
                } else {
                    this.starGraphics = new Sprite(
                        TextureService.STAR_SYMBOLS["binary_scannable"],
                    );
                }
            }
            // ---- Non binary stars ----
            else if (this.hasBlackHole()) {
                this.starGraphics = new Sprite(
                    TextureService.STAR_SYMBOLS["black_hole"],
                );
            } else if (this._isDeadStar()) {
                this.starGraphics = new Sprite(
                    TextureService.STAR_SYMBOLS["unscannable"],
                );
            } else if (this.data.homeStar) {
                this.starGraphics = new Sprite(
                    TextureService.STAR_SYMBOLS["home"],
                );
            } else {
                this.starGraphics = new Sprite(
                    TextureService.STAR_SYMBOLS["scannable"],
                );
            }
        } else {
            this.starGraphics = new Sprite(
                TextureService.STAR_SYMBOLS["unscannable"],
            );
            this.starGraphics.tint = 0xa0a0a0;
        }

        if (
            this.starDataService.isCapitalEliminationCapital(
                this.game,
                this.data,
            )
        ) {
            this.starGraphics.tint = 0xff0000;
        } else if (
            this.starDataService.isCapitalCaptureCapital(this.game, this.data)
        ) {
            this.starGraphics.tint = 0xffa500;
        }

        this.starGraphics.anchor.set(0.5);
        this.starGraphics.width = 24.0 / 2.0;
        this.starGraphics.height = 24.0 / 2.0;

        this.container.addChild(this.starGraphics);
    }

    drawPulsar() {
        if (!this.isPulsar()) {
            return;
        }

        if (this.pulsarGraphics) {
            this.container.removeChild(this.pulsarGraphics);
            this.pulsarGraphics = null;
        }

        let seed = this.data._id;
        Star.seededRNG.seed(seed);

        const player = this._getStarPlayer();
        const playerColour = player
            ? this.context.getPlayerColour(player._id)
            : 0xffffff;

        this.pulsarGraphics = new Graphics();
        this.pulsarGraphics.zIndex = -1;
        this.pulsarGraphics.moveTo(0, -20);
        this.pulsarGraphics.lineTo(0, 20);
        this.pulsarGraphics.ellipse(-5, 0, 5, 5);
        this.pulsarGraphics.ellipse(5, 0, 5, 5);
        this.pulsarGraphics.ellipse(-8, 0, 8, 8);
        this.pulsarGraphics.ellipse(8, 0, 8, 8);
        this.pulsarGraphics.stroke({
            width: 1,
            color: playerColour,
            alpha: 0.5,
        });
        this.pulsarGraphics.rotation = Star.seededRNG.random() * Math.PI * 2.0;

        this.container.addChild(this.pulsarGraphics);
    }

    drawNebula() {
        if (!this.hasNebula()) {
            return;
        }
        if (this.nebulaSprite) {
            this.container.removeChild(this.nebulaSprite);
            this.nebulaSprite = null;
        }
        let seed = this.data._id;
        Star.seededRNG.seed(seed);
        let nebulaTexture = TextureService.getRandomStarNebulaTexture(seed);
        this.nebulaSprite = new Sprite(nebulaTexture);

        let spriteSize = 64;
        this.nebulaSprite.width = spriteSize;
        this.nebulaSprite.height = spriteSize;
        this.nebulaSprite.anchor.set(0.5);
        this.nebulaSprite.rotation = Star.seededRNG.random() * Math.PI * 2.0;

        let player = this._getStarPlayer();
        let playerColour = player
            ? this.context.getPlayerColour(player._id)
            : 0xffffff;
        this.nebulaSprite.tint = playerColour;
        //this.nebulaSprite.blendMode = BLEND_MODES.ADD // for extra punch

        const blendSprite = new Sprite(nebulaTexture);
        blendSprite.anchor.set(0.5);
        blendSprite.rotation = Star.seededRNG.random() * Math.PI * 2.0;
        blendSprite.tint = playerColour;
        this.nebulaSprite.addChild(blendSprite);

        this.container.addChild(this.nebulaSprite);
    }

    drawWormHole() {
        if (this.wormHoleSprite) {
            this.container.removeChild(this.wormHoleSprite);
            this.wormHoleSprite = null;
        }

        if (!this.data.wormHoleToStarId) {
            return;
        }

        const texture = TextureService.getRandomWormholeTexture();
        this.wormHoleSprite = new Sprite(texture);

        let spriteSize = 40;
        this.wormHoleSprite.width = spriteSize;
        this.wormHoleSprite.height = spriteSize;
        this.wormHoleSprite.anchor.set(0.5);
        this.wormHoleSprite.rotation = Math.random() * Math.PI * 2.0;
        this.wormHoleSprite.alpha = 0.35;

        let player = this._getStarPlayer();
        let playerColour = player
            ? this.context.getPlayerColour(player._id)
            : 0xffffff;
        this.wormHoleSprite.tint = playerColour;

        this.container.addChild(this.wormHoleSprite);
    }

    drawAsteroidField() {
        if (!this.hasAsteroidField()) {
            return;
        }
        if (this.asteroidFieldSprite) {
            this.container.removeChild(this.asteroidFieldSprite);
            this.asteroidFieldSprite = null;
        }
        let seed = this.data._id;
        Star.seededRNG.seed(seed);
        let texture = TextureService.getRandomStarAsteroidFieldTexture(seed);
        this.asteroidFieldSprite = new Sprite(texture);

        let spriteSize = 64;
        this.asteroidFieldSprite.width = spriteSize;
        this.asteroidFieldSprite.height = spriteSize;
        this.asteroidFieldSprite.anchor.set(0.5);
        this.asteroidFieldSprite.rotation =
            Star.seededRNG.random() * Math.PI * 2.0;

        const player = this._getStarPlayer();
        const playerColour = player
            ? this.context.getPlayerColour(player._id)
            : 0xffffff;
        this.asteroidFieldSprite.tint = playerColour;

        this.container.addChild(this.asteroidFieldSprite);
    }

    drawSpecialist() {
        if (this.specialistSprite) {
            this.container.removeChild(this.specialistSprite);
            this.specialistSprite = null;
        }

        if (!this.hasSpecialist()) {
            return;
        }

        //FIXME potential resource leak, should not create a new sprite every time
        let specialistTexture = TextureService.getSpecialistTexture(
            this.data.specialist!.key,
        );
        this.specialistSprite = new Sprite(specialistTexture);

        this.specialistSprite.width = 10;
        this.specialistSprite.height = 10;
        this.specialistSprite.x = -5;
        this.specialistSprite.y = -5;

        if (
            this.starDataService.isCapitalEliminationCapital(
                this.game,
                this.data,
            )
        ) {
            this.specialistSprite.tint = 0xff0000;
        } else if (
            this.starDataService.isCapitalCaptureCapital(this.game, this.data)
        ) {
            this.starGraphics.tint = 0xffa500;
        }

        this.container.addChild(this.specialistSprite);
    }

    hasNebula() {
        return this.data.isNebula;
    }

    hasAsteroidField() {
        return this.data.isAsteroidField;
    }

    hasBlackHole() {
        return this.data.isBlackHole;
    }

    isBinaryStar() {
        return this.data.isBinaryStar;
    }

    isPulsar() {
        return this.data.isPulsar;
    }

    hasSpecialist() {
        return (
            this.data.specialistId &&
            this.data.specialistId > 0 &&
            this.data.specialist
        );
    }

    drawPlanets() {
        this.planets.draw();
    }

    drawNaturalResourcesRing() {
        if (!this.data.naturalResources) {
            return;
        }
        for (let lod = 0; lod < MAX_LOD; lod += 1) {
            if (!this.naturalResourcesRingGraphics[lod]) {
                this.naturalResourcesRingGraphics[lod] = new Graphics();
                this.naturalResourcesRingGraphics[lod].alpha = 0.5;
                this.naturalResourcesRingGraphics[lod].zIndex = -1;
            }
            this.naturalResourcesRingGraphics[lod].clear();

            if (this.userSettings.map.naturalResources !== "single-ring") {
                return;
            }

            const averageNaturalResources =
                Helpers.calculateAverageNaturalResources(
                    this.data.naturalResources,
                );

            // let ringRadius = this.data.naturalResources > 100 ? 100 : this.data.naturalResources
            // TODO: Experimental:
            let ringRadius =
                averageNaturalResources <= 50
                    ? averageNaturalResources
                    : averageNaturalResources > 400
                      ? 100
                      : 12.5 * Math.log2(averageNaturalResources / 50) + 50;

            ringRadius /= 8.0;
            let lineWidth = 1.0 / 8.0;
            ringRadius *= lod + 1;
            lineWidth *= lod + 1;
            this.naturalResourcesRingGraphics[lod].clear();
            this.naturalResourcesRingGraphics[lod].circle(
                0,
                0,
                ringRadius * 0.75,
            );
            this.naturalResourcesRingGraphics[lod].stroke({
                width: lineWidth,
                color: 0xffffff,
                alpha: this.userSettings.map.naturalResourcesRingOpacity,
            });
            this.naturalResourcesRingGraphics[lod].scale.x =
                1.0 / ((1.0 / 8.0) * (lod + 1));
            this.naturalResourcesRingGraphics[lod].scale.y =
                1.0 / ((1.0 / 8.0) * (lod + 1));
            this.naturalResourcesRingGraphics[lod].zIndex = 9;
            this.container.addChild(this.naturalResourcesRingGraphics[lod]);
        }
    }

    drawColour() {
        if (this.shapePartGraphics) {
            this.container.removeChild(this.shapePartGraphics);
            this.container.removeChild(this.shapeFullGraphics);
        }

        // Get the player who owns the star.
        const player = this._getStarPlayer();

        if (!player) {
            return;
        }

        if (Object.keys(TextureService.PLAYER_SYMBOLS).includes(player.shape)) {
            const wgFlag = this.data.warpGate ? 1 : 0;

            this.shapePartGraphics = new Sprite(
                TextureService.PLAYER_SYMBOLS[player.shape][2 + wgFlag],
            );
            this.shapeFullGraphics = new Sprite(
                TextureService.PLAYER_SYMBOLS[player.shape][0 + wgFlag],
            );
        }

        const playerColour = this.context.getPlayerColour(player._id);

        this.shapePartGraphics.tint = playerColour;
        this.shapeFullGraphics.tint = playerColour;
        this.shapePartGraphics.anchor.set(0.5);
        this.shapeFullGraphics.anchor.set(0.5);
        this.shapePartGraphics.width = 28.0;
        this.shapePartGraphics.height = 28.0;
        this.shapeFullGraphics.width = 28.0;
        this.shapeFullGraphics.height = 28.0;
        this.container.addChild(this.shapePartGraphics);
        this.container.addChild(this.shapeFullGraphics);
    }

    _hasUnknownShips() {
        let carriersOrbiting = this._getStarCarriers();
        let scramblers = carriersOrbiting.reduce(
            (sum, c) => sum + (c.ships === null ? 1 : 0),
            0,
        );
        let scrambler = this.data.ships == null;
        return (scramblers || scrambler) && this.data.isInScanningRange;
    }

    drawName() {
        if (!this.nameText) {
            const bitmapFont = {
                fontFamily: "chakrapetch",
                fontSize: NAME_SIZE,
            };
            this.nameText = new BitmapText({
                text: this.data.name,
                style: bitmapFont,
            });
            this.nameText.x = 5;

            this.container.addChild(this.nameText);
        }

        let totalKnownShips =
            (this.data.ships || 0) + this._getStarCarrierShips();
        let carriersOrbiting = this._getStarCarriers();

        if (
            (this.data.ownedByPlayerId || carriersOrbiting) &&
            (totalKnownShips > 0 ||
                carriersOrbiting.length > 0 ||
                this._hasUnknownShips())
        ) {
            this.nameText.y = (NAME_SIZE + SHIPS_SMALL_SIZE) / 2.0 - NAME_SIZE;
        } else {
            this.nameText.y = -(this.nameText.height / 2);
        }
    }

    drawShips() {
        if (this.shipsSmallText) {
            this.container.removeChild(this.shipsSmallText);
            this.shipsSmallText = null;
        }
        if (this.shipsBigText) {
            this.container.removeChild(this.shipsBigText);
            this.shipsBigText = null;
        }

        let totalKnownShips =
            (this.data.ships || 0) + this._getStarCarrierShips();

        let carriersOrbiting = this._getStarCarriers();
        let carrierCount = carriersOrbiting.length;

        let shipsText: string | undefined = undefined;

        if (this.data.ownedByPlayerId || carriersOrbiting.length) {
            let scramblers = 0;

            if (carriersOrbiting) {
                scramblers = carriersOrbiting.reduce(
                    (sum, c) => sum + (c.ships === null ? 1 : 0),
                    0,
                );
            }

            if (scramblers == carrierCount && this.data.ships == null) {
                shipsText = "???";
            } else if (totalKnownShips > 0 || scramblers > 0) {
                shipsText = totalKnownShips.toString();

                if (scramblers > 0 || this.data.ships == null) {
                    shipsText += "*";
                }
            }

            if (carrierCount) {
                shipsText += "/";
                shipsText += carrierCount.toString();

                if (
                    helpers.isStarHasMultiplePlayersInOrbit(
                        this.game,
                        this.data,
                    )
                ) {
                    shipsText += "+";
                }
            }
        }

        if (shipsText) {
            if (!this.shipsSmallText) {
                let bitmapFont = {
                    fontFamily: "chakrapetch",
                    fontSize: SHIPS_SMALL_SIZE,
                };
                this.shipsSmallText = new BitmapText({
                    text: this.data.name,
                    style: bitmapFont,
                });
                this.container.addChild(this.shipsSmallText);
                this.shipsSmallText.x = 5;
                this.shipsSmallText.y =
                    -this.shipsSmallText.height +
                    ((NAME_SIZE + SHIPS_SMALL_SIZE) / 2.0 - NAME_SIZE);
            }

            if (!this.shipsBigText) {
                let bitmapFont = {
                    fontFamily: "chakrapetch",
                    fontSize: SHIPS_BIG_SIZE,
                };
                this.shipsBigText = new BitmapText({
                    text: this.data.name,
                    style: bitmapFont,
                });
                this.container.addChild(this.shipsBigText);
                this.shipsBigText.x = 5;
                this.shipsBigText.y = -this.shipsBigText.height / 2.0;
            }
            this.shipsSmallText.text = shipsText;
            this.shipsBigText.text = shipsText;
        }
    }

    drawInfrastructure() {
        if (this.infrastructureText) {
            this.container.removeChild(this.infrastructureText);
            this.infrastructureText = null;
        }

        if (
            this.data.infrastructure &&
            (this.data.infrastructure.economy == null ||
                this.data.infrastructure.industry == null ||
                this.data.infrastructure.science == null)
        ) {
            return;
        }

        if (!this.infrastructureText) {
            if (this.data.ownedByPlayerId && this.data.infrastructure) {
                let displayInfrastructure = `${this.data.infrastructure.economy} ${this.data.infrastructure.industry} ${this.data.infrastructure.science}`;

                let bitmapFont = { fontFamily: "chakrapetch", fontSize: 4 };
                this.infrastructureText = new BitmapText({
                    text: displayInfrastructure,
                    style: bitmapFont,
                });
                this.infrastructureText.x = -(
                    this.infrastructureText.width / 2.0
                );
                this.infrastructureText.y = -15;
                this.infrastructureText.alpha = 0.75;

                this.container.addChild(this.infrastructureText);
            }
        }
    }

    drawInfrastructureBulkIgnored() {
        if (this.infrastructureBulkIgnoredText) {
            this.container.removeChild(this.infrastructureBulkIgnoredText);
            this.infrastructureBulkIgnoredText = null;
        }

        if (this.data.ignoreBulkUpgrade == null) {
            return;
        }

        if (!this.infrastructureBulkIgnoredText) {
            let displayInfrastructure = `${this.data.ignoreBulkUpgrade.economy ? " " : "E"} ${this.data.ignoreBulkUpgrade.industry ? " " : "I"} ${this.data.ignoreBulkUpgrade.science ? " " : "S"}`;

            let bitmapFont = { fontFamily: "chakrapetch", fontSize: 8 };
            this.infrastructureBulkIgnoredText = new BitmapText({
                text: displayInfrastructure,
                style: bitmapFont,
            });
            this.infrastructureBulkIgnoredText.x = -(
                this.infrastructureBulkIgnoredText.width / 2.0
            );
            this.infrastructureBulkIgnoredText.y = 12;
            this.infrastructureBulkIgnoredText.visible =
                this.showIgnoreBulkUpgradeInfrastructure;

            this.container.addChild(this.infrastructureBulkIgnoredText);
        }
    }

    drawTarget() {
        this.targetedGraphics.clear();

        if (this.data.targeted) {
            this.targetedGraphics.moveTo(9, -9);
            this.targetedGraphics.lineTo(-9, 9);
            this.targetedGraphics.moveTo(-9, -9);
            this.targetedGraphics.lineTo(9, 9);
            this.targetedGraphics.closePath();
            this.targetedGraphics.stroke({
                width: 2,
                color: 0xff0000,
            });
        }
    }

    drawSelectedCircle() {
        this.selectedGraphics.clear();

        if (this.isSelected) {
            this.selectedGraphics.circle(0, 0, 20);
            this.selectedGraphics.stroke({
                width: 0.5,
                color: 0xffffff,
                alpha: 0.3,
            });
        }
    }

    drawKingOfTheHillCircle() {
        this.kingOfTheHillGraphics.clear();

        if (this.data.isKingOfTheHillStar) {
            this.kingOfTheHillGraphics.circle(0, 0, 20);
            this.kingOfTheHillGraphics.stroke({
                width: 0.5,
                color: 0xffffff,
                alpha: 0.5,
            });
        }
    }

    onZoomChanging(zoomPercent: number) {
        this.zoomPercent = zoomPercent;
        this.setScale(zoomPercent);
        this.updateVisibility();
    }

    setScale(zoomPercent: number) {
        const depth = Helpers.calculateDepthModifier(
            this.userSettings,
            this.data._id,
        );

        this.container.alpha = depth;
        const baseScale =
            depth *
            (this.userSettings.map.objectsDepth === "disabled" ? 1 : 1.5);

        const clampedScaling =
            this.userSettings.map.objectsScaling == "clamped";
        //divide these by 4 to allow more control while keeping the UI as int
        const minScale = this.userSettings.map.objectsMinimumScale / 4.0;
        const maxScale = this.userSettings.map.objectsMaximumScale / 4.0;

        if (clampedScaling) {
            const currentScale = zoomPercent / 100;
            if (currentScale < minScale) {
                this.container.scale.x = (1 / currentScale) * minScale;
                this.container.scale.y = (1 / currentScale) * minScale;
            } else if (currentScale > maxScale) {
                this.container.scale.x = (1 / currentScale) * maxScale;
                this.container.scale.y = (1 / currentScale) * maxScale;
            } else {
                this.container.scale.x = baseScale;
                this.container.scale.y = baseScale;
            }
        } else {
            this.container.scale.x = baseScale;
            this.container.scale.y = baseScale;
        }
    }

    onClicked(e: FederatedPointerEvent | null, tryMultiSelect = true) {
        const click = () => {
            this.emit("onStarClicked", {
                starData: this.data,
                tryMultiSelect,
                eventData: e!,
                permitCallback: () => {
                    // Need to do this otherwise sometimes text gets highlighted.
                    this.deselectAllText();

                    if (this._getStarPlayer()) {
                        this.updateVisibility();
                        // this.setScale()
                    }
                },
            });
        };

        if (e) {
            const button = e.button;

            if (button === 2) {
                this.emit("onStarRightClicked", {
                    starData: this.data,
                    eventData: e,
                    tryMultiSelect: false,
                });
            } else if (button === 1) {
                this.emit("onStarDefaultClicked", {
                    starData: this.data,
                    eventData: e,
                    tryMultiSelect: false,
                });
            } else {
                click();
            }
        } else {
            click();
        }
    }

    updateVisibility() {
        const apparentScale =
            this.container.scale.x * (this.zoomPercent / 100.0);
        const lod = Math.max(
            Math.min(Math.floor(apparentScale) - 1, MAX_LOD - 1),
            0.0,
        );
        for (let l = 0; l < MAX_LOD; l += 1) {
            const ring = this.naturalResourcesRingGraphics[l];

            if (ring) {
                ring.visible = false;
            }
        }

        this.starGraphics.visible = !this.hasSpecialist(); //|| this.hasBlackHole()

        if (this.userSettings.map.naturalResources !== "planets") {
            if (this.naturalResourcesRingGraphics[lod]) {
                this.naturalResourcesRingGraphics[lod].visible = Boolean(
                    this.data.isInScanningRange &&
                    this.zoomPercent >=
                        this.userSettings.map.zoomLevels.star.naturalResources,
                );
            }
        }

        if (this.nameText) {
            this.nameText.visible =
                this.isSelected ||
                this.zoomPercent >= this.userSettings.map.zoomLevels.star.name;
        }

        this.planets.updateVisibility(this.zoomPercent);

        if (this.infrastructureText)
            this.infrastructureText.visible =
                this.isSelected ||
                this.zoomPercent >=
                    this.userSettings.map.zoomLevels.star.infrastructure;

        let small_ships =
            this.zoomPercent >= this.userSettings.map.zoomLevels.star.name ||
            this.isSelected;
        let visible_ships = !!(
            this.data.isInScanningRange &&
            (this.isSelected ||
                this.isMouseOver ||
                this.zoomPercent >=
                    this.userSettings.map.zoomLevels.star.shipCount)
        );

        if (this.shipsSmallText)
            this.shipsSmallText.visible = small_ships && visible_ships;
        if (this.shipsBigText)
            this.shipsBigText.visible = !small_ships && visible_ships;

        let partial_ring =
            (this.shipsBigText && this.shipsBigText.visible) ||
            (this.shipsSmallText && this.shipsSmallText.visible) ||
            (this.nameText && this.nameText.visible);

        this.shapePartGraphics.visible = Boolean(partial_ring);
        this.shapeFullGraphics.visible = !partial_ring;
    }

    deselectAllText() {
        if (window.getSelection) {
            window.getSelection()?.removeAllRanges();
        }
    }

    onMouseOver() {
        this.isMouseOver = true;

        this.emit("onStarMouseOver", this.data);
    }

    onMouseOut() {
        this.isMouseOver = false;

        this.emit("onStarMouseOut", this.data);
    }

    //This could in the future be a setter function on ZoomPercent
    refreshZoom(zoomPercent: number) {
        this.zoomPercent = zoomPercent;
        this._updateDepthLevel();
    }

    //I hope I can make this independant from this class at some point
    ///Updates the zoomDepth value according to zoomPercent
    _updateDepthLevel() {
        let old = this.zoomDepth;
        this.zoomDepth = 1;
        for (let depth in this.userSettings.map.zoomLevels.star) {
            if (
                this.userSettings.map.zoomLevels.star[depth] < this.zoomPercent
            ) {
                this.zoomDepth = this.userSettings.map.zoomLevels.star[depth];
            }
        }

        //Update everything
        if (this.zoomDepth != old) this.updateVisibility();
    }

    destroy() {
        this.container.destroy();
    }

    _isDeadStar() {
        return (
            this.data.naturalResources != null &&
            this.data.naturalResources.economy <= 0 &&
            this.data.naturalResources.industry <= 0 &&
            this.data.naturalResources.science <= 0
        );
    }

    select() {
        this.isSelected = true;
        this.drawSelectedCircle();
        this.emit("onSelected", this.data);
        this.updateVisibility();
    }

    unselect() {
        this.isSelected = false;
        this.drawSelectedCircle();
        this.emit("onUnselected", this.data);
        this.updateVisibility();
    }

    toggleSelected() {
        if (this.isSelected) {
            this.unselect();
        } else {
            this.select();
        }
    }

    showIgnoreBulkUpgrade() {
        this.showIgnoreBulkUpgradeInfrastructure = true;

        if (this.infrastructureBulkIgnoredText) {
            this.infrastructureBulkIgnoredText.visible =
                this.showIgnoreBulkUpgradeInfrastructure;
        }
    }

    hideIgnoreBulkUpgrade() {
        this.showIgnoreBulkUpgradeInfrastructure = false;

        if (this.infrastructureBulkIgnoredText) {
            this.infrastructureBulkIgnoredText.visible =
                this.showIgnoreBulkUpgradeInfrastructure;
        }
    }
}

export default Star;
