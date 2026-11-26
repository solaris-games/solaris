import Helpers from "../helpers";
import type { UserGameSettings } from "@solaris/common";
import type { Star } from "../types/game";
import { Container, Graphics } from "pixi.js";

const MAX_LOD = 4;

export class NaturalResourcesRing {
    naturalResourcesRingGraphics: Graphics[];
    container: Container;
    userSettings: UserGameSettings;
    data: Star;

    constructor(userSettings: UserGameSettings, data: Star) {
        this.naturalResourcesRingGraphics = new Array(MAX_LOD);
        this.userSettings = userSettings;
        this.data = data;
        this.container = new Container();
    }

    updateVisibility(zoomPercent: number, apparentScale: number) {
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

        if (this.userSettings.map.naturalResources !== "planets") {
            if (this.naturalResourcesRingGraphics[lod]) {
                this.naturalResourcesRingGraphics[lod].visible = Boolean(
                    this.data.isInScanningRange &&
                    zoomPercent >=
                        this.userSettings.map.zoomLevels.star.naturalResources,
                );
            }
        }
    }

    draw() {
        if (this.userSettings.map.naturalResources !== "single-ring") {
            return;
        }

        if (!this.data.naturalResources) {
            return;
        }

        this.container.removeChildren();

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

            this.naturalResourcesRingGraphics[lod].visible = false;
            this.container.addChild(this.naturalResourcesRingGraphics[lod]);
        }
    }
}
