import { ValidationError } from "solaris-common";
import Repository from './repository';
import SessionService from './session';
import { DBObjectId } from './types/DBObjectId';
import { Game } from './types/Game';
import { User } from './types/User';

import moment from "moment";

export default class AdminService {

    constructor(private userRepo: Repository<User>, 
                private gameRepo: Repository<Game>,
                private sessionService: SessionService) {
    }

    async addWarning(userId: DBObjectId, text: string) {
        const newWarning = {
            text,
            date: moment().utc()
        }

        await this.userRepo.updateOne({
            _id: userId
        }, {
            $push: {
                warnings: newWarning
            }
        });
    }

    async listUsers(userId: DBObjectId, limit: number) {

        let user: User | null = await this.userRepo.findOne({
            _id: userId
        }, {
            roles: 1
        });

        if (user == null) {
            return;
        }

        let select;

        if (user.roles.administrator) {
            select = {
                username: 1,
                email: 1,
                credits: 1,
                banned: 1,
                roles: 1,
                emailEnabled: 1,
                lastSeen: 1,
                lastSeenIP: 1,
                isEstablishedPlayer: 1,
                warnings: 1
            };
        } else if (user.roles.communityManager) {
            select = {
                username: 1,
                isEstablishedPlayer: 1,
                warnings: 1,
                banned: 1,
            };
        } else {
            throw new ValidationError("User role insufficient")
        }

        return await this.userRepo.find({
            // All users
        }, 
        select, {
            lastSeen: -1
        }, limit);
    }

    async listPasswordResets() {
        return await this.userRepo.find({
            resetPasswordToken: { $ne: null }
        }, {
            username: 1,
            email: 1,
            resetPasswordToken: 1
        }, {
            lastSeen: -1
        });
    }

    async listGames(finishedLimit: number) {
        const unfinishedGames = await this.gameRepo.find({
            'settings.general.type': { $ne: 'tutorial' }, // Non tutorial games
            'state.endDate': { $eq: null }, // Game is unfinished
        }, {
            'settings.general': 1,
            'state': 1
        }, {
            _id: -1
        });

        const finishedGames = await this.gameRepo.find({
            'settings.general.type': { $ne: 'tutorial' }, // Non tutorial games
            'state.endDate': { $ne: null }, // Game is finished
            }, {
            'settings.general': 1,
            'state': 1
        }, {
            _id: -1
        },
        finishedLimit);

        return unfinishedGames.concat(finishedGames);
    }

    async setRoleContributor(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.contributor': enabled
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.roles.contributor = enabled;
        });
    }

    async setRoleDeveloper(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.developer': enabled
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.roles.developer = enabled;
        });
    }

    async setRoleCommunityManager(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.communityManager': enabled
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.roles.communityManager = enabled;
        });
    }

    async setRoleGameMaster(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.gameMaster': enabled
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.roles.gameMaster = enabled;
        });
    }

    async ban(userId: DBObjectId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'banned': true
        });
    }

    async unban(userId: DBObjectId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'banned': false
        });
    }

    async resetAchievements(userId: DBObjectId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'achievements.victories': 0,
            'achievements.victories1v1': 0,
            'achievements.level': 0,
            'achievements.rank': 0,
            'achievements.eloRating': null,
            'achievements.renown': 0,
            'achievements.joined': 0,
            'achievements.completed': 0,
            'achievements.quit': 0,
            'achievements.defeated': 0,
            'achievements.defeated1v1': 0,
            'achievements.afk': 0,
            'achievements.combat.kills.ships': 0,
            'achievements.combat.kills.carriers': 0,
            'achievements.combat.kills.specialists': 0,
            'achievements.combat.losses.ships': 0,
            'achievements.combat.losses.carriers': 0,
            'achievements.combat.losses.specialists': 0,
            'achievements.combat.stars.captured': 0,
            'achievements.combat.stars.lost': 0,
            'achievements.combat.homeStars.captured': 0,
            'achievements.combat.homeStars.lost': 0,
            'achievements.infrastructure.economy': 0,
            'achievements.infrastructure.industry': 0,
            'achievements.infrastructure.science': 0,
            'achievements.infrastructure.warpGates': 0,
            'achievements.infrastructure.warpGatesDestroyed': 0,
            'achievements.infrastructure.carriers': 0,
            'achievements.infrastructure.specialistsHired': 0,
            'achievements.research.scanning': 0,
            'achievements.research.hyperspace': 0,
            'achievements.research.terraforming': 0,
            'achievements.research.experimentation': 0,
            'achievements.research.weapons': 0,
            'achievements.research.banking': 0,
            'achievements.research.manufacturing': 0,
            'achievements.research.specialists': 0,
            'achievements.trade.creditsSent': 0,
            'achievements.trade.creditsReceived': 0,
            'achievements.trade.creditsSpecialistsSent': 0,
            'achievements.trade.creditsSpecialistsReceived': 0,
            'achievements.trade.technologySent': 0,
            'achievements.trade.technologyReceived': 0,
            'achievements.trade.giftsSent': 0,
            'achievements.trade.giftsReceived': 0,
            'achievements.trade.renownSent': 0
        });
    }

    async promoteToEstablishedPlayer(userId: DBObjectId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                isEstablishedPlayer: true
            }
        });
    }

    async setGameFeatured(gameId: DBObjectId, featured: boolean) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            'settings.general.featured': featured
        });
    }

    async setGameTimeMachine(gameId: DBObjectId, enabled: string) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            'settings.general.timeMachine': enabled
        });
    }

    async getInsights() {
        const oneDayAgo = moment().utc().add(-1, 'days').toDate();
        const twoDaysAgo = moment().utc().add(-2, 'days').toDate();
        const oneWeekAgo = moment().utc().add(-7, 'days').toDate();
        const twoWeeksAgo = moment().utc().add(-14, 'days').toDate();

        const oneDayAgoId = this.userRepo.objectIdFromDate(oneDayAgo);
        const twoDaysAgoId = this.userRepo.objectIdFromDate(twoDaysAgo);
        const oneWeekAgoId = this.userRepo.objectIdFromDate(oneWeekAgo);
        const twoWeeksAgoId = this.userRepo.objectIdFromDate(twoWeeksAgo);

        // Registrations
        const registrations1d = await this.userRepo.count({
            _id: { $gt: oneDayAgoId }
        });

        const registrations2d = await this.userRepo.count({
            _id: { $gt: twoDaysAgoId }
        });

        const registrations7d = await this.userRepo.count({
            _id: { $gt: oneWeekAgoId }
        });

        const registrations14d = await this.userRepo.count({
            _id: { $gt: twoWeeksAgoId }
        });

        // Last seen
        const lastSeen1d = await this.userRepo.count({
            lastSeen: { $gt: oneDayAgo }
        });

        const lastSeen2d = await this.userRepo.count({
            lastSeen: { $gt: twoDaysAgo }
        });

        const lastSeen7d = await this.userRepo.count({
            lastSeen: { $gt: oneWeekAgo }
        });

        const lastSeen14d = await this.userRepo.count({
            lastSeen: { $gt: twoWeeksAgo }
        });

        // TODO: AFKs
        // TODO: Joins
        // TODO: Quits
        // TODO: Games started
        // TODO: Games ended
        // TODO: Badges purchased
        // TODO: Credits purchased
        // TODO: Tutorials started
        // TODO: Tutorials finished

        return [
            {
                name: 'Registrations',
                d1: registrations1d,
                d2: registrations2d,
                d7: registrations7d,
                d14: registrations14d
            },
            {
                name: 'Last Seen',
                d1: lastSeen1d,
                d2: lastSeen2d,
                d7: lastSeen7d,
                d14: lastSeen14d
            }
        ];
    }
};
