import { BitmapText, Container } from "pixi.js";
import type { UserGameSettings } from "@solaris/common";
import Helpers from "./helpers";
import type { Game, Star as StarData } from "./types/game";

const NAME_SIZE = 4;
const SHIPS_SMALL_SIZE = 6;
const SHIPS_BIG_SIZE = 10;

export class StarLabels {
    game: Game;
    data: StarData;
    userSettings: UserGameSettings;
    container: Container;
    nameText: BitmapText | null = null;
    shipsSmallText: BitmapText | null = null;
    shipsBigText: BitmapText | null = null;

    constructor(game: Game, data: StarData, userSettings: UserGameSettings) {
        this.game = game;
        this.data = data;
        this.userSettings = userSettings;
        this.container = new Container();
    }

    update(game: Game, data: StarData, userSettings: UserGameSettings) {
        this.game = game;
        this.data = data;
        this.userSettings = userSettings;
    }

    draw() {
        const shipsText = this._getShipsText();

        this._drawName();
        this._drawShips(shipsText);
    }

    _drawName() {
        if (this.nameText) {
            this.container.removeChild(this.nameText);
            this.nameText = null;
        }

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

        const totalKnownShips =
            (this.data.ships || 0) + this._getCarrierShips();
        const carriersOrbiting = this._getCarriers();

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

    _getShipsText(): string | undefined {
        const totalKnownShips =
            (this.data.ships || 0) + this._getCarrierShips();

        const carriersOrbiting = this._getCarriers();
        const carrierCount = carriersOrbiting.length;

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
                    Helpers.isStarHasMultiplePlayersInOrbit(
                        this.game,
                        this.data,
                    )
                ) {
                    shipsText += "+";
                }
            }
        }

        return shipsText;
    }

    _drawShips(shipsText: string | undefined) {
        if (this.shipsSmallText) {
            this.container.removeChild(this.shipsSmallText);
            this.shipsSmallText = null;
        }
        if (this.shipsBigText) {
            this.container.removeChild(this.shipsBigText);
            this.shipsBigText = null;
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

    updateVisibility(
        zoomPercent: number,
        isSelected: boolean,
        isMouseOver: boolean,
    ) {
        if (this.nameText) {
            this.nameText.visible =
                isSelected ||
                zoomPercent >= this.userSettings.map.zoomLevels.star.name;
        }

        let small_ships =
            zoomPercent >= this.userSettings.map.zoomLevels.star.name ||
            isSelected;
        let visible_ships = !!(
            this.data.isInScanningRange &&
            (isSelected ||
                isMouseOver ||
                zoomPercent >= this.userSettings.map.zoomLevels.star.shipCount)
        );

        if (this.shipsSmallText)
            this.shipsSmallText.visible = small_ships && visible_ships;
        if (this.shipsBigText)
            this.shipsBigText.visible = !small_ships && visible_ships;
    }

    get partialTextVisible(): boolean {
        return Boolean(
            (this.shipsBigText && this.shipsBigText.visible) ||
            (this.shipsSmallText && this.shipsSmallText.visible) ||
            (this.nameText && this.nameText.visible),
        );
    }

    _getCarriers() {
        return Helpers.getCarriersOrbitingStar(this.game, this.data);
    }

    _getCarrierShips() {
        return this._getCarriers().reduce((sum, c) => sum + (c.ships || 0), 0);
    }

    _hasUnknownShips() {
        let carriersOrbiting = this._getCarriers();
        let scramblers = carriersOrbiting.reduce(
            (sum, c) => sum + (c.ships === null ? 1 : 0),
            0,
        );
        let scrambler = this.data.ships == null;
        return (scramblers || scrambler) && this.data.isInScanningRange;
    }
}

export default StarLabels;
