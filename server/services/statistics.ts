import Repository from "./repository";
import {StatsSlice, Statistics} from "solaris-common";
import {DBObjectId} from "./types/DBObjectId";

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

export default class StatisticsService {
    statsSliceRepository: Repository<StatsSlice<DBObjectId>>;

    constructor(statsSliceRepository: Repository<StatsSlice<DBObjectId>>) {
        this.statsSliceRepository = statsSliceRepository;
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

    async getSlice(gameId: DBObjectId, playerId: DBObjectId) {
        return this.statsSliceRepository.findOne({ gameId, playerId });
    }

    async modifyStats(gameId: DBObjectId, playerId: DBObjectId, modif: (stats: Statistics) => void) {
        const statsSlice = await this.getOrCreateSliceActive(gameId, playerId);

        modif(statsSlice.stats);

        // @ts-ignore
        statsSlice.save();
    }
}