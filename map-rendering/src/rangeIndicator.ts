import { Container, Graphics } from "pixi.js";
import { type Game, type Star } from "./types/game";
import { DistanceService, StarDataService } from "@solaris/common";
import type { DrawingContext } from "./container";

export class RangeIndicator {
    container: Container;
    graphics_hyperspaceRange: Graphics;
    graphics_scanningRange: Graphics;
    game: Game;
    starDataService: StarDataService;
    distanceService: DistanceService;
    context: DrawingContext;

    constructor(
        game: Game,
        distanceService: DistanceService,
        starDataService: StarDataService,
        context: DrawingContext,
    ) {
        this.game = game;
        this.starDataService = starDataService;
        this.distanceService = distanceService;
        this.context = context;

        this.container = new Container();
        this.graphics_scanningRange = new Graphics();
        this.graphics_hyperspaceRange = new Graphics();

        this.container.addChild(this.graphics_scanningRange);
        this.container.addChild(this.graphics_hyperspaceRange);
    }

    undrawScanningRange() {
        this.graphics_scanningRange.visible = false;
    }

    drawScanningRange(star: Star) {
        this.graphics_scanningRange.clear();

        if (!star.ownedByPlayerId) {
            return;
        }

        // Get the player who owns the star.
        const player = this.game.galaxy.players.find(
            (p) => p._id === star.ownedByPlayerId,
        );

        // Dead stars do not have scanning range
        if (!player || this.starDataService.isDeadStar(star)) {
            return;
        }

        this.graphics_scanningRange.x = star.location.x;
        this.graphics_scanningRange.y = star.location.y;

        const radius = this.distanceService.getScanningDistance(
            this.game,
            star.effectiveTechs?.scanning || 1,
        );

        this.graphics_scanningRange.circle(0, 0, radius);
        this.graphics_scanningRange.fill({
            color: this.context.getPlayerColour(player._id),
            alpha: 0.075,
        });
        this.graphics_scanningRange.stroke({
            width: 1,
            color: 0xffffff,
            alpha: 0.2,
        });
        this.graphics_scanningRange.zIndex = -1;
        this.container.zIndex = -1;

        this.graphics_scanningRange.visible = true;
    }

    undrawHyperspaceRange() {
        this.graphics_hyperspaceRange.visible = false;
    }

    drawHyperspaceRange(star: Star) {
        this.graphics_hyperspaceRange.clear();

        if (!star.ownedByPlayerId) {
            return;
        }

        // Get the player who owns the star.
        const player = this.game.galaxy.players.find(
            (p) => p._id === star.ownedByPlayerId,
        );

        // Dead stars do not have scanning range
        if (!player || this.starDataService.isDeadStar(star)) {
            return;
        }

        this.graphics_hyperspaceRange.x = star.location.x;
        this.graphics_hyperspaceRange.y = star.location.y;

        const radius = this.distanceService.getHyperspaceDistance(
            this.game,
            star.effectiveTechs?.hyperspace || 1,
        );

        this.graphics_hyperspaceRange.star(0, 0, radius, radius, radius - 3);
        this.graphics_hyperspaceRange.fill({
            color: this.context.getPlayerColour(player._id),
            alpha: 0.075,
        });
        this.graphics_hyperspaceRange.stroke({
            width: 1,
            color: 0xffffff,
            alpha: 0.2,
        });

        this.graphics_hyperspaceRange.zIndex = -1;
        this.container.zIndex = -1;

        this.graphics_hyperspaceRange.visible = true;
    }
}
