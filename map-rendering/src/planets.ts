import { Application, Container, Graphics, Ticker } from "pixi.js";
import type { UserGameSettings } from "@solaris/common";
import type { DrawingContext } from "./container";
import Helpers from "./helpers";
import type { Game, Star } from "./types/game";

type Planet = {
    index: number;
    container: Container;
    rotationSpeed: number;
    rotationDirection: boolean;
};

export class Planets {
    app: Application;
    userSettings: UserGameSettings;
    context: DrawingContext;
    game: Game;
    data: Star;
    container: Container;
    planets: Planet[] | null;

    constructor(
        app: Application,
        userSettings: UserGameSettings,
        context: DrawingContext,
        game: Game,
        data: Star,
    ) {
        this.app = app;
        this.container = new Container();
        this.planets = null;
        this.userSettings = userSettings;
        this.context = context;
        this.game = game;
        this.data = data;

        this.orbitPlanetsStep = this.orbitPlanetsStep.bind(this);
    }

    draw() {
        this.unsubscribeToEvents();
        this.planets = null;
        this.container.removeChildren();

        if (this.userSettings.map.naturalResources !== "planets") {
            return;
        }

        // The more resources a star has the more planets it has.
        const planetCount = this._getPlanetsCount();

        if (planetCount === 0) {
            return;
        }

        const playerColour = this.data.ownedByPlayerId
            ? this.context.getPlayerColour(this.data.ownedByPlayerId)
            : 0xffffff;

        const rotationDirection = this._getPlanetOrbitDirection();
        const rotationSpeedModifier = this._getPlanetOrbitSpeed();

        this.planets = [];

        for (let i = 0; i < planetCount; i++) {
            const distanceToStar = 15 + 5 * i;
            const planetSize =
                (Math.floor(Math.abs(this.data.location.y) + distanceToStar) %
                    1.5) +
                0.5;

            const orbitGraphics = new Graphics();
            orbitGraphics.circle(0, 0, distanceToStar - planetSize / 2);
            orbitGraphics.stroke({
                width: 0.3,
                color: 0xffffff,
                alpha: this.userSettings.map.naturalResourcesRingOpacity,
            });
            this.container.addChild(orbitGraphics);

            const planetGraphics = new Graphics();

            const planetAlpha = this.data.isInScanningRange ? 1.0 : 0.3;

            planetGraphics.circle(planetSize / 2, 0, planetSize);
            planetGraphics.fill({
                color: playerColour,
                alpha: planetAlpha,
            });

            const planetContainer = new Container();

            planetContainer.addChild(planetGraphics);

            planetContainer.pivot.set(distanceToStar, 0);

            const rotationSpeed = (planetCount - i) / rotationSpeedModifier;

            this.container.addChild(planetContainer);

            this.planets.push({
                index: i,
                container: planetContainer,
                rotationSpeed,
                rotationDirection,
            });
        }

        this.subscribeToEvents();
    }

    subscribeToEvents() {
        if (this.container) {
            this.app.ticker.add(this.orbitPlanetsStep);
        }
    }

    unsubscribeToEvents() {
        if (this.container) {
            this.app.ticker.remove(this.orbitPlanetsStep);
        }
    }

    orbitPlanetsStep(ticker: Ticker) {
        if (!this.planets) {
            return;
        }

        const delta = ticker.deltaTime;

        for (let planet of this.planets) {
            if (planet.rotationDirection) {
                planet.container.rotation += planet.rotationSpeed * delta;
            } else {
                planet.container.rotation -= planet.rotationSpeed * delta;
            }
        }
    }

    _getPlanetsCount() {
        if (!this.data.naturalResources) {
            return 0;
        }
        const averageNaturalResources =
            Helpers.calculateAverageNaturalResources(
                this.data.naturalResources,
            );
        return Math.min(Math.floor((averageNaturalResources / 45) * 3), 5); // Anything over 45 gets 3 planets
    }

    updateVisibility(zoomPercent: number) {
        this.container.visible = Boolean(
            this.data.isInScanningRange &&
            zoomPercent >=
                this.userSettings.map.zoomLevels.star.naturalResources,
        );
    }

    _getPlanetOrbitDirection() {
        return Math.floor(Math.abs(this.data.location.y)) % 2 === 0;
    }

    _getPlanetOrbitSpeed() {
        return Math.floor(Math.random() * (1000 - 500 + 1) + 500); // Random number between 500 and 1000
    }
}
