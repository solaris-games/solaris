import { NextFunction, Request, Response } from 'express';
import { ValidationError } from "solaris-common";
import {DBObjectId, objectIdFromString} from "../../services/types/DBObjectId";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import {logger} from "../../utils/logging";

const log = logger("Player Mutex Middleware");

export interface PlayerMutexMiddleware {
    wait: () => (req: Request<{ gameId?: string }>, res: Response, next: NextFunction) => Promise<any>;
    release: (ignoreCheckUserInGame?: boolean) => (req: Request<{ gameId?: DBObjectId }>, res: Response, next: NextFunction) => Promise<any>;
}

export const middleware = (container: DependencyContainer): PlayerMutexMiddleware => {

    return {
        wait: () => {
            return async (req: Request<{gameId?: string}>, res: Response, next: NextFunction) => {
                try {
                    if (req.params.gameId == null) {
                        throw new ValidationError(`Game ID is required.`);
                    }

                    // Acquire the game's players here as we won't have loaded the game yet.
                    let gamePlayers: { _id: DBObjectId, userId: DBObjectId | null }[] | undefined = await container.gameService.getPlayersLean(objectIdFromString(req.params.gameId));

                    if (gamePlayers == null) {
                        // If the game Id was valid it'd be an empty array instead of null or undefined.'
                        throw new ValidationError(`Game ID is not valid!`);
                    }

                    if (req.session.userId == null) {
                        throw new ValidationError('User ID is required.');
                    }

                    let userPlayerId: DBObjectId | undefined = gamePlayers.find(p => p.userId?.toString() === req.session.userId?.toString())?._id;

                    if (userPlayerId == null) {
                        throw new ValidationError('You are not participating in this game.');
                    }

                    if (req.playerMutexLocks != null && req.playerMutexLocks.length > 0) {
                        throw new Error('Request is already in-progress.');
                    }

                    type playerIdsType = { playerId, withPlayerId, toPlayerId };

                    let playerIds: string[] = [userPlayerId.toString()];

                    let playerIdFields: (keyof playerIdsType)[] = ['playerId', 'withPlayerId', 'toPlayerId'];

                    let playerIdObjs: playerIdsType[] = [];

                    let requestParamsPossiblePlayerIds: playerIdsType = req.params as unknown as {
                        playerId,
                        withPlayerId,
                        toPlayerId
                    };

                    let requestBodyPossiblePlayerIds: playerIdsType = req.body as {
                        playerId,
                        withPlayerId,
                        toPlayerId
                    };

                    if (requestParamsPossiblePlayerIds != null) {
                        playerIdObjs.push(requestParamsPossiblePlayerIds);
                    }

                    if (requestBodyPossiblePlayerIds != null) {
                        playerIdObjs.push(requestBodyPossiblePlayerIds);
                    }

                    for (let playerIdField of playerIdFields) {
                        for (let playerIdsObj of playerIdObjs) {
                            if (playerIdsObj != null) {
                                let possiblePlayerId = playerIdsObj[playerIdField]?.toString();

                                if (possiblePlayerId != null && !playerIds.includes(possiblePlayerId)) {
                                    playerIds.push(possiblePlayerId);
                                }
                            }
                        }
                    }

                    req.playerMutexLocks = await container.gamePlayerMutexService.acquireMutexLocks(req.params.gameId.toString(), playerIds);
    
                    return next();
                } catch (err) {
                    return next(err);
                }
            }
        },
        release: (ignoreCheckUserInGame?: boolean) => {
            return async (req: Request<{ gameId?: DBObjectId }>, res: Response, next: NextFunction) => {
                try {
                    if (req.params.gameId == null) {
                        throw new ValidationError(`Game ID is required.`);
                    }

                    // Acquire the game's players here as we won't have loaded the game yet.
                    let gamePlayers: { _id: DBObjectId, userId: DBObjectId | null }[] | undefined = await container.gameService.getPlayersLean(req.params.gameId);

                    if (gamePlayers == null) {
                        // If the game Id was valid it'd be an empty array instead of null or undefined.'
                        throw new ValidationError(`Game ID is not valid!`);
                    }

                    if (req.session.userId == null) {
                        throw new ValidationError('User ID is required.');
                    }

                    if (!ignoreCheckUserInGame) {
                        const userPlayerId: DBObjectId | undefined = gamePlayers.find(p => p.userId?.toString() === req.session.userId?.toString())?._id;

                        if (userPlayerId == null) {
                            throw new ValidationError('You are not participating in this game.');
                        }
                    }

                    if (req.playerMutexLocks != null) {
                        await container.gamePlayerMutexService.releaseMutexLocks(req.params.gameId.toString(), req.playerMutexLocks);
                    }

                    return next();
                } catch (err) {
                    log.error({
                        error: err,
                        gameId: req.params.gameId,
                    }, "PlayerMutex threw: ", err);
                    return next(err);
                }
            }
        }
    }
};
