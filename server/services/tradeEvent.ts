import { Game } from "./types/Game";
import { DBObjectId } from "./types/DBObjectId";
import { BaseGameEvent, TradeEvent } from "@solaris/common";
import Repository from "./repository";

export default class TradeEventService {
    constructor(private eventRepo: Repository<BaseGameEvent<DBObjectId>>) {}

    async listTradeEventsBetweenPlayers(
        game: Game,
        playerId: DBObjectId,
        playerIds: DBObjectId[],
    ): Promise<TradeEvent<DBObjectId>[]> {
        const events = await this.eventRepo.find({
            gameId: game._id,
            playerId: playerId,
            type: {
                $in: [
                    "playerCreditsReceived",
                    "playerCreditsSpecialistsReceived",
                    "playerRenownReceived",
                    "playerTechnologyReceived",
                    "playerGiftReceived",
                    "playerCreditsSent",
                    "playerCreditsSpecialistsSent",
                    "playerRenownSent",
                    "playerTechnologySent",
                    "playerGiftSent",
                    "playerDebtSettled",
                    "playerDebtForgiven",
                ],
            },
            $or: [
                { "data.fromPlayerId": { $in: playerIds } },
                { "data.toPlayerId": { $in: playerIds } },
                {
                    $and: [
                        { "data.debtorPlayerId": { $in: playerIds } },
                        { "data.creditorPlayerId": { $in: playerIds } },
                    ],
                },
            ],
        });

        return events.map((ev) => {
            return {
                ...ev,
                sentDate: ev._id.getTimestamp(),
            } as TradeEvent<DBObjectId>;
        });
    }
}
