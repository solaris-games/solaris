import {DependencyContainer} from "../../services/types/DependencyContainer";
import {parseColourOverrideRequest} from "../requests/colour";

export default (container: DependencyContainer) => {
    return {
        list: async (req, res, next) => {
            try {
                const colours = container.playerColourService.getColourList();
                res.status(200).json(colours);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        setColourOverride: async (req, res, next) => {
            try {
                const body = parseColourOverrideRequest(req.body);

                await container.playerColourService.setColourOverride(req.game, req.player, body.playerId, body.colour);
                res.status(200).json({});
                return next();
            } catch (err) {
                return next(err);
            }
        }
    };
};