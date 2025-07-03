import Repository from "./repository";
import {StatsSlice, Statistics} from "solaris-common";
import {DBObjectId} from "./types/DBObjectId";
import {Game} from "./types/Game";
import {logger} from "../utils/logging";
import UserService from "./user";

const EMPTY_STATS: Statistics = {
    combat: {
        kills: {
            ships: 0,
            carriers: 0,
            specialists: 0,
        },
        losses: {
            ships: 0,
            carriers: 0,
            specialists: 0,
        },
        stars: {
            captured: 0,
            lost: 0,
        },
        homeStars: {
            captured: 0,
            lost: 0,
        },
    },
    infrastructure: {
        economy: 0,
        industry: 0,
        science: 0,
        warpGates: 0,
        warpGatesDestroyed: 0,
        carriers: 0,
        specialistsHired: 0,
    },
    research: {
        scanning: 0,
        hyperspace: 0,
        banking: 0,
        experimentation: 0,
        weapons: 0,
        manufacturing: 0,
        specialists: 0,
        terraforming: 0,
    },
    trade: {
        creditsSent: 0,
        creditsReceived: 0,
        creditsSpecialistsReceived: 0,
        creditsSpecialistsSent: 0,
        technologyReceived: 0,
        technologySent: 0,
        giftsReceived: 0,
        giftsSent: 0,
    },
};

const log = logger("Statistics Service");

export default class StatisticsService {
    statsSliceRepository: Repository<StatsSlice<DBObjectId>>;
    userService: UserService;

    constructor(statsSliceRepository: Repository<StatsSlice<DBObjectId>>, userService: UserService) {
        this.statsSliceRepository = statsSliceRepository;
        this.userService = userService;
    }

    async getSliceActive(gameId: DBObjectId, playerId: DBObjectId): Promise<StatsSlice<DBObjectId> | null> {
        return this.statsSliceRepository.findOneAsModel({
            gameId,
            playerId,
        });
    }

    async getOrCreateSliceActive(gameId: DBObjectId, playerId: DBObjectId): Promise<StatsSlice<DBObjectId>> {
        return this.statsSliceRepository.findOrCreateAsModel({ gameId, playerId }, {
            gameId,
            playerId,
            closed: false,
            processed: false,
            stats: EMPTY_STATS,
        });
    }

    async _getSlicesForGame(gameId: DBObjectId): Promise<StatsSlice<DBObjectId>[]> {
        return this.statsSliceRepository.find({
            gameId,
            closed: false,
        });
    }

    async getSlice(gameId: DBObjectId, playerId: DBObjectId) {
        return this.statsSliceRepository.findOne({ gameId, playerId });
    }

    async modifyStats(gameId: DBObjectId, playerId: DBObjectId, modif: (stats: Statistics) => void) {
        const statsSlice = await this.getOrCreateSliceActive(gameId, playerId);

        modif(statsSlice.stats);

        // @ts-ignore
        statsSlice.save();
    }

    async closeStatsSlicesForGame(game: Game) {
        const slices = await this._getSlicesForGame(game._id);

        const bulkOps = slices.map(slice => ({
            updateOne: {
                filter: { _id: slice._id },
                update: {
                    $set: {
                        closed: true,
                    }
                }
            }
        }));

        if (bulkOps.length > 0) {
            await this.statsSliceRepository.bulkWrite(bulkOps);
        }
    }

    async getClosedUnprocessedSlicesActive(): Promise<StatsSlice<DBObjectId>[]> {
        return this.statsSliceRepository.findAsModels({
            closed: true,
            processed: false,
        });
    }

    async processSlice(game: Game, slice: StatsSlice<DBObjectId>) {
        const player = game.galaxy.players.find(p => p._id.toString() === slice.playerId.toString());

        if (!player) {
            log.warn(`Player with ID ${slice.playerId} not found in game ${game._id}, skipping slice processing.`);
            return;
        }

        if (slice.processed) {
            log.warn(`Slice for player ${slice.playerId} in game ${game._id} is already processed, skipping.`);
            return;
        }

        if (!slice.closed) {
            log.warn(`Slice for player ${slice.playerId} in game ${game._id} is not closed, skipping.`);
            return;
        }

        const user = await this.userService.getByIdActive(player.userId!);

        if (!user) {
            log.warn(`User with ID ${player.userId} not found, skipping slice processing for player ${slice.playerId}.`);
            return;
        }


    }
}