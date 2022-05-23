import { DBObjectId } from './types/DBObjectId';
import Repository from './repository';
import { Game } from './types/Game';
import { User } from './types/User';

export default class AdminService {
    
    userRepo: Repository<User>;
    gameRepo: Repository<Game>;

    constructor(
        userRepo: Repository<User>, 
        gameRepo: Repository<Game>
    ) {
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
    }

    async listUsers(isAdmin: boolean, limit: number) {
        let select = isAdmin ? {
            username: 1,
            email: 1,
            credits: 1,
            banned: 1,
            roles: 1,
            emailEnabled: 1,
            lastSeen: 1,
            lastSeenIP: 1,
            isEstablishedPlayer: 1
        } : {
            username: 1,
            isEstablishedPlayer: 1
        };

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

    async listGames(limit: number) {
        return await this.gameRepo.find({
            'settings.general.type': { $ne: 'tutorial' } // Non tutorial games
        }, {
            'settings.general': 1,
            'state': 1
        }, {
            _id: -1
        },
        limit);
    }

    async setRoleContributor(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.contributor': enabled
        });
    }

    async setRoleDeveloper(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.developer': enabled
        });
    }

    async setRoleCommunityManager(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.communityManager': enabled
        });
    }

    async setRoleGameMaster(userId: DBObjectId, enabled: boolean = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.gameMaster': enabled
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
            'achievements.rank': 0,
            'achievements.eloRating': null,
            'achievements.renown': 0,
            'achievements.joined': 0,
            'achievements.completed': 0,
            'achievements.quit': 0,
            'achievements.defeated': 0,
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

};
