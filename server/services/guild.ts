const mongoose = require('mongoose');
import { ValidationError } from "@solaris-common";
import Repository from './repository';
import SessionService from './session';
import { DBObjectId } from './types/DBObjectId';
import { Guild, GuildLeaderboard, GuildRank, GuildUserApplication, GuildWithUsers } from './types/Guild';
import { User } from './types/User';
import UserService from './user';

function toProperCase(string: string) {
    return string.replace(/\w\S*/g, function(txt: string){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

export default class GuildService {
    static SORTERS = ['totalRank', 'memberCount']

    MAX_MEMBER_COUNT = 100
    MAX_INVITE_COUNT = 100
    CREATE_GUILD_CREDITS_COST = 3
    RENAME_GUILD_CREDITS_COST = 1

    constructor(private guildModel,
                private guildRepo: Repository<Guild>,
                private userRepo: Repository<User>,
                private userService: UserService,
                private sessionService: SessionService
    ) { }

    async list() {
        let users = await this.userService.listUsersInGuilds();

        let guilds = await this.guildRepo.find({
            // All guilds
        }, {
            name: 1,
            tag: 1
        });

        let guildsWithRank: GuildRank[] = guilds.map(guild => {
            let usersInGuild = users.filter(x => x.guildId && x.guildId.toString() === guild._id.toString());

            let totalRank = usersInGuild.reduce((sum, i) => sum + i.achievements.rank, 0);

            return {
                ...guild,
                totalRank
            };
        });

        return guildsWithRank.sort((a, b) => b.totalRank - a.totalRank);
    }

    async listInfoByIds(guildIds: DBObjectId[]) {
        return await this.guildRepo.find({
            _id: {
                $in: guildIds
            }
        }, {
            name: 1,
            tag: 1
        });
    }

    async getInfoById(guildId: DBObjectId) {
        return await this.guildRepo.findOne({
            _id: guildId
        }, {
            name: 1,
            tag: 1
        });
    }

    async listInvitations(userId: DBObjectId) {
        let guilds = await this.guildRepo.find({
            invitees: {
                $in: [mongoose.Types.ObjectId(userId)]
            }
        }, {
            name: 1,
            tag: 1
        });

        return guilds;
    }

    async listApplications(userId: DBObjectId): Promise<GuildUserApplication[]> {
        let guilds = await this.guildRepo.find({
            // All guilds
        }, {
            _id: 1,
            name: 1,
            tag: 1,
            applicants: 1
        });

        return guilds.map(g => {
            let hasApplied = this._isApplicant(g, userId);

            return {
                _id: g._id,
                name: g.name,
                tag: g.tag,
                hasApplied
            };
        });
    }

    async detailWithUserInfo(guildId: DBObjectId, withInvitationsAndApplications: boolean = false): Promise<GuildWithUsers> {
        if (guildId == null) {
            throw new ValidationError("Guild ID is required.");
        }

        let guild = await this.guildRepo.findOne({
            _id: guildId
        });

        if (!guild) {
            throw new ValidationError("Guild not found.");
        }

        let guildWithUsers: GuildWithUsers = {
            _id: guild._id,
            name: guild.name,
            tag: guild.tag
        };

        let userSelectObject = {
            username: 1,
            'achievements.level': 1,
            'achievements.rank': 1,
            'achievements.victories': 1,
            'achievements.renown': 1
        };

        let usersInGuild = await this.userService.listUsersInGuild(guildId, userSelectObject);
        
        guildWithUsers.leader = usersInGuild.find(x => x._id.toString() === guild!.leader.toString())!;
        guildWithUsers.officers = usersInGuild.filter(x => this._isOfficer(guild!, x._id));
        guildWithUsers.members = usersInGuild.filter(x => this._isMember(guild!, x._id));

        if (withInvitationsAndApplications) {
            guildWithUsers.invitees = await this.userService.listUsers(guild.invitees, userSelectObject);
            guildWithUsers.applicants = await this.userService.listUsers(guild.applicants, userSelectObject);
        } else {
            delete guildWithUsers.invitees;
            delete guildWithUsers.applicants;
        }

        guildWithUsers.totalRank = usersInGuild.reduce((sum, i) => sum + i.achievements.rank, 0);

        return guildWithUsers;
    }

    async detail(guildId: DBObjectId): Promise<Guild> {
        if (guildId == null) {
            throw new ValidationError("Guild ID is required.");
        }

        let guild = await this.guildRepo.findOne({
            _id: guildId
        });

        if (!guild) {
            throw new ValidationError("Guild not found.");
        }
        
        return guild;
    }

    async detailMyGuild(userId: DBObjectId, withUserInfo: boolean = false) {
        let user = await this.userService.getById(userId, {
            guildId: 1
        });

        if (!user || !user.guildId) {
            return null;
        }

        return await this.detailWithUserInfo(user.guildId, true);
    }

    async create(userId: DBObjectId, name: string, tag: string) {
        let isUserInAGuild = await this._isUserInAGuild(userId);

        if (isUserInAGuild) {
            throw new ValidationError(`Cannot create a guild if you are already a member in another guild.`);
        }

        let userCredits = await this.userService.getCredits(userId);

        if (userCredits < this.CREATE_GUILD_CREDITS_COST) {
            throw new ValidationError(`You do not have enough credits to found a guild. The cost is ${this.CREATE_GUILD_CREDITS_COST} credits, you have ${userCredits}.`);
        }

        name = toProperCase(name.trim());
        tag = tag.trim().replace(/\s/g, '');

        let existing = await this.guildRepo.findOne({
            $or: [
                { name },
                { tag }
            ]
        });

        if (existing) {
            throw new ValidationError(`A guild with the same name or tag already exists.`);
        }

        // Remove all invites and applications to this user for any guild.
        await this.declineAllInvitations(userId);
        await this.withdrawAllApplications(userId);

        let guild = new this.guildModel();

        guild.leader = userId;
        guild.name = name;
        guild.tag = tag;

        await guild.save();

        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                guildId: guild._id
            },
            $inc: {
                credits: -this.CREATE_GUILD_CREDITS_COST
            }
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.userCredits -= this.CREATE_GUILD_CREDITS_COST;
        });

        return guild;
    }

    async rename(userId: DBObjectId, newName: string, newTag: string) {
        let user = await this.userService.getById(userId, {
            guildId: 1
        });

        if (!user!.guildId) {
            throw new ValidationError('You are not a member of a guild.');
        }

        let guild = await this.detail(user!.guildId!);

        let isLeader = this._isLeader(guild, userId);

        if (!isLeader) {
            throw new ValidationError('Only guild leaders can rename their guild.');
        }

        let userCredits = await this.userService.getCredits(userId);

        if (userCredits < this.RENAME_GUILD_CREDITS_COST) {
            throw new ValidationError(`You do not have enough credits to rename your guild. The cost is ${this.RENAME_GUILD_CREDITS_COST} credits, you have ${userCredits}.`);
        }

        newName = toProperCase(newName.trim());
        newTag = newTag.trim().replace(/\s/g, '');

        // Update the guild
        await this.guildRepo.updateOne({
            _id: guild._id
        }, {
            $set: {
                name: newName,
                tag: newTag
            }
        });

        // Deduct user credits
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $inc: {
                credits: -this.RENAME_GUILD_CREDITS_COST
            }
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.userCredits -= this.RENAME_GUILD_CREDITS_COST;
        });
    }

    async delete(userId: DBObjectId, guildId: DBObjectId) {
        let guild = await this.detail(guildId);

        if (!this._isLeader(guild, userId)) {
            throw new ValidationError(`You do not have the authority to disband the guild.`);
        }

        await this.userRepo.updateMany({
            guildId
        }, {
            $unset: {
                guildId: undefined
            }
        });

        await this.guildRepo.deleteOne({ 
            _id: guildId 
        });
    }

    async invite(username: string, guildId: DBObjectId, invitedByUserId: DBObjectId) {
        let user = await this.userService.getByUsername(username, {
            username: 1,
            'achievements.level': 1,
            'achievements.rank': 1,
            'achievements.victories': 1,
            'achievements.renown': 1
        });
        
        if (!user) {
            throw new ValidationError(`A player with the username does not exist.`);
        }

        let userId = user._id;

        let isUserInAGuild = await this._isUserInAGuild(userId);

        if (isUserInAGuild) {
            throw new ValidationError(`Cannot invite this user, the user is already a member of a guild.`);
        }

        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, invitedByUserId) || this._isOfficer(guild, invitedByUserId);

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to invite new members to the guild.`);
        }

        if (this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user has already been invited to the guild.`);
        }

        if (this._isApplicant(guild, userId)) {
            return this.accept(userId, guildId, invitedByUserId);
        }

        if (guild.invitees.length >= this.MAX_INVITE_COUNT) {
            throw new ValidationError(`There is a maximum of ${this.MAX_INVITE_COUNT} invitees at one time.`);
        }

        await this.guildRepo.updateOne({
            _id: guildId
        }, {
            $push: {
                invitees: userId
            }
        });

        return user;
    }

    async uninvite(userId: DBObjectId, guildId: DBObjectId, uninvitedByUserId: DBObjectId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, uninvitedByUserId) || this._isOfficer(guild, uninvitedByUserId);

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to uninvite users from the guild.`);
        }

        if (!this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user has not been invited to the guild.`);
        }

        await this.guildRepo.updateOne({
            _id: guildId
        }, {
            $pull: {
                invitees: userId
            }
        });
    }

    async decline(userId: DBObjectId, guildId: DBObjectId) {
        let guild = await this.detail(guildId);

        if (!this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user is not an invitee of this guild.`);
        }

        await this.guildRepo.updateOne({
            _id: guildId
        }, {
            $pull: {
                invitees: userId
            }
        });
    }

    async declineAllInvitations(userId: DBObjectId) {
        await this.guildRepo.updateMany({
            invitees: {
                $in: [userId]
            }
        }, {
            $pull: {
                invitees: userId
            }
        });
    }

    async withdrawAllApplications(userId: DBObjectId) {
        await this.guildRepo.updateMany({
            applicants: {
                $in: [userId]
            }
        }, {
            $pull: {
                applicants: userId
            }
        });
    }

    async apply(userId: DBObjectId, guildId: DBObjectId) {
        let isUserInAGuild = await this._isUserInAGuild(userId);

        if (isUserInAGuild) {
            throw new ValidationError(`Cannot apply to this guild, you are already a member of a guild.`);
        }

        let guild = await this.detail(guildId);

        if (this._isApplicant(guild, userId)) {
            throw new ValidationError(`You have already applied to become a member of this guild.`);
        }

        await this.guildRepo.updateOne({
            _id: guildId
        }, {
            $push: {
                applicants: userId
            }
        });
    }

    async withdraw(userId: DBObjectId, guildId: DBObjectId) {
        let guild = await this.detail(guildId);

        if (!this._isApplicant(guild, userId)) {
            throw new ValidationError(`You have not applied to become a member of this guild.`);
        }

        await this.guildRepo.updateOne({
            _id: guildId
        }, {
            $pull: {
                applicants: userId
            }
        });
    }

    async accept(userId: DBObjectId, guildId: DBObjectId, acceptedByUserId: DBObjectId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, acceptedByUserId) || this._isOfficer(guild, acceptedByUserId);

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to accept applications to the guild.`);
        }

        await this.join(userId, guildId);
    }

    async reject(userId: DBObjectId, guildId: DBObjectId, rejectedByUserId: DBObjectId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, rejectedByUserId) || this._isOfficer(guild, rejectedByUserId);

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to reject applications to the guild.`);
        }

        if (!this._isApplicant(guild, userId)) {
            throw new ValidationError(`The user has not applied to become a member of the guild.`);
        }

        await this.guildRepo.updateOne({
            _id: guildId
        }, {
            $pull: {
                applicants: userId
            }
        });
    }

    async join(userId: DBObjectId, guildId: DBObjectId) {
        let guild = await this.detail(guildId);

        if (!this._isApplicant(guild, userId) && !this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user is not an invitee or applicant of this guild.`);
        }

        // Remove all invites and applications to this user for any guild.
        await this.declineAllInvitations(userId);
        await this.withdrawAllApplications(userId);

        // Add the user to the chosen guild.
        await this.guildRepo.updateOne({
            _id: guildId
        }, {
            $push: {
                members: userId
            }
        });

        // Set the user's guild id
        await this.userRepo.updateOne({ 
            _id: userId
        }, {
            $set: {
                guildId
            }
        });

        guild.members.push(userId);

        // If maximum members reached, clear pending invites and applications.
        if (this._totalMemberCount(guild) >= this.MAX_MEMBER_COUNT) {
            await this.guildRepo.updateOne({
                _id: guildId
            }, {
                $set: {
                    invitees: [],
                    applicants: []
                }
            });
        }
    }

    async tryLeave(userId: DBObjectId) {
        let guild = await this.detailMyGuild(userId, false);

        if (guild) {
            await this.leave(userId, guild._id);
        }
    }

    async leave(userId: DBObjectId, guildId: DBObjectId) {
        let guild = await this.detail(guildId);

        if (this._isLeader(guild, userId)) {
            throw new ValidationError(`Cannot leave your guild if you are the leader, promote a new guild leader first.`);
        }

        await this._removeUser(guild, userId);
    }

    async promote(userId: DBObjectId, guildId: DBObjectId, promotedByUserId: DBObjectId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, promotedByUserId)
            || (this._isOfficer(guild, promotedByUserId) && this._isMember(guild, userId));

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to promote this member.`);
        }

        if (this._isOfficer(guild, userId)) {
            // Officer to leader
            await this.guildRepo.updateOne({
                _id: guildId,
                'officers': userId
            }, {
                $set: {
                    leader: userId,
                    'officers.$': promotedByUserId
                }
            });
        } else if (this._isMember(guild, userId)) {
            // Member to officer
            await this.guildRepo.updateOne({
                _id: guildId
            }, {
                $pull: {
                    members: userId
                },
                $push: {
                    officers: userId
                }
            });
        } else {
            throw new ValidationError(`The user is not a member of this guild.`);
        }
    }

    async demote(userId: DBObjectId, guildId: DBObjectId, demotedByUserId: DBObjectId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, demotedByUserId);

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to demote this member.`);
        }

        let updateObject: any | null = null;

        if (this._isOfficer(guild, userId)) {
            // Officer to member
            updateObject = {
                $pull: {
                    officers: userId
                },
                $push: {
                    members: userId
                }
            };
        } else if (this._isMember(guild, userId)) {
            throw new ValidationError(`Members cannot be demoted.`);
        } else {
            throw new ValidationError(`The user is not a member of this guild.`);
        }

        await this.guildRepo.updateOne({
            _id: guildId
        }, updateObject);
    }

    async kick(userId: DBObjectId, guildId: DBObjectId, kickedByUserId: DBObjectId) {
        let guild = await this.detail(guildId);

        if (this._isLeader(guild, userId)) {
            throw new ValidationError(`Cannot kick the guild leader.`);
        }

        let hasPermission = this._isLeader(guild, kickedByUserId)
            || (this._isOfficer(guild, kickedByUserId) && this._isMember(guild, userId));

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to kick this member.`);
        }

        await this._removeUser(guild, userId);
    }

    async _removeUser(guild: Guild, userId: DBObjectId) {
        let updateObject: any | null = null;

        if (this._isOfficer(guild, userId)) {
            updateObject = {
                $pull: {
                    officers: userId
                }
            }
        } else if (this._isMember(guild, userId)) {
            updateObject = {
                $pull: {
                    members: userId
                }
            }
        } else {
            throw new ValidationError(`The user is not a member of this guild.`);
        }

        await this.guildRepo.updateOne({
            _id: guild._id
        }, updateObject);

        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                guildId: null
            }
        });
    }

    _isLeader(guild: Guild, userId: DBObjectId) {
        return guild.leader.toString() === userId.toString();
    }

    _isOfficer(guild: Guild, userId: DBObjectId) {
        return guild.officers.find(x => x.toString() === userId.toString()) != null;
    }

    _isMember(guild: Guild, userId: DBObjectId) {
        return guild.members.find(x => x.toString() === userId.toString()) != null;
    }

    _isInvitee(guild: Guild, userId: DBObjectId) {
        return guild.invitees.find(x => x.toString() === userId.toString()) != null;
    }

    _isApplicant(guild: Guild, userId: DBObjectId) {
        return guild.applicants.find(x => x.toString() === userId.toString()) != null;
    }

    _totalMemberCount(guild: Guild) {
        return 1 + guild.officers.length + guild.members.length;
    }

    async _isUserInAGuild(userId: DBObjectId) {
        return await this.userRepo.count({
            _id: userId,
            guildId: { $ne: null }
        }) > 0;
    }

    async listUserRanksInGuilds() {
        return await this.userRepo.find({
            guildId: { $ne: null }
        }, {
            guildId: 1,
            'achievements.rank': 1
        });
    }

    async getLeaderboard(limit: number | null, sortingKey: string) {
        limit = limit || 100;
        sortingKey = GuildService.SORTERS.includes(sortingKey) ? sortingKey : 'totalRank';

        let guilds = await this.guildRepo.find({}, {
            name: 1,
            tag: 1,
            leader: 1,
            officers: 1,
            members: 1
        });

        // Calculate the rankings of each guild.
        let users = await this.listUserRanksInGuilds();

        let guildsWithRank: GuildLeaderboard[] = guilds.map(guild => {
            let usersInGuild = users.filter(x => x.guildId!.toString() === guild._id.toString());

            let totalRank = usersInGuild.reduce((sum, i) => sum + i.achievements.rank, 0);
            let memberCount = usersInGuild.length;

            return {
                ...guild,
                totalRank,
                memberCount
            }
        });

        let leaderboard = guildsWithRank
                        .sort((a, b) => b[sortingKey] - a[sortingKey])
                        .slice(0, limit);

        for (let i = 0; i < leaderboard.length; i++) {
            leaderboard[i].position = i + 1;
        }

        return {
            leaderboard,
            totalGuilds: guildsWithRank.length
        };
    }

};
