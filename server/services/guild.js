const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

function toProperCase(string) {
    return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

module.exports = class GuildService {

    MAX_MEMBER_COUNT = 100
    MAX_INVITE_COUNT = 100
    CREATE_GUILD_CREDITS_COST = 3
    
    constructor(guildModel, userModel) {
        this.userModel = userModel;
        this.guildModel = guildModel;
    }

    async list() {
        let users = await this.userModel.find({ 
            guildId: { $ne: null }
        }, {
            'achievements.rank': 1
        })
        .lean()
        .exec();

        let guilds = await this.guildModel.find({}, {
            name: 1,
            tag: 1
        })
        .lean()
        .exec();

        for (let guild in guilds) {
            let usersInGuild = users.filter(x => x.guildId.equals(guild._id));

            guild.totalRank = usersInGuild.reduce((sum, i) => sum + i.achievements.rank, 0);
        }

        return guilds.sort((a, b) => b.totalRank - a.totalRank);
    }

    async listInfoByIds(guildIds) {
        return await this.guildModel.find({
            _id: {
                $in: guildIds
            }
        }, {
            name: 1,
            tag: 1
        })
        .lean()
        .exec();
    }

    async listInvitations(userId) {
        let guilds = await this.guildModel.find({
            invitees: {
                $in: [userId]
            }
        }, {
            name: 1,
            tag: 1
        })
        .lean()
        .exec();

        return guilds;
    }

    async detail(guildId, withUserInfo = false) {
        let guild = await this.guildModel.findOne({
            _id: guildId
        })
        .lean({ defaults: true })
        .exec();

        if (withUserInfo) {
            let userSelectObject = {
                username: 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.renown': 1
            };

            let usersInGuild = await this.userModel.find({
                guildId
            }, userSelectObject)
            .lean()
            .exec();

            let usersInvited = await this.userModel.find({
                _id: {
                    $in: guild.invitees
                }
            }, userSelectObject)
            .lean()
            .exec();
    
            guild.leader = usersInGuild.find(x => x._id.equals(guild.leader));
            guild.officers = usersInGuild.filter(x => this._isOfficer(guild, x._id));
            guild.members = usersInGuild.filter(x => this._isMember(guild, x._id));
            guild.invitees = usersInvited;

            guild.totalRank = usersInGuild.reduce((sum, i) => sum + i.achievements.rank, 0);
        }

        return guild;
    }

    async detailMyGuild(userId, withUserInfo = false) {
        let user = await this.userModel.findOne({
            _id: userId
        }, {
            guildId: 1
        })
        .lean()
        .exec();

        if (!user.guildId) {
            return null;
        }

        return await this.detail(user.guildId, withUserInfo);
    }

    async create(userId, name, tag) {
        let isUserInAGuild = await this._isUserInAGuild(userId);

        if (isUserInAGuild) {
            throw new ValidationError(`Cannot create a guild if you are already a member in another guild.`);
        }

        let userCredits = await this.userModel.findOne({
            _id: userId
        }, {
            credits: 1
        })
        .lean()
        .exec();

        if (userCredits.credits < this.CREATE_GUILD_CREDITS_COST) {
            throw new ValidationError(`You do not have enough credits to found a guild. The cost is ${this.CREATE_GUILD_CREDITS_COST} credits, you have ${userCredits.credits}.`);
        }

        name = toProperCase(name.trim());
        tag = tag.trim().replace(/\s/g, '');

        let existing = await this.guildModel.findOne({
            $or: [
                { name },
                { tag }
            ]
        })
        .exec();

        if (existing) {
            throw new ValidationError(`A guild with the same name or tag already exists.`);
        }

        let guild = new this.guildModel();

        guild.leader = userId;
        guild.name = name;
        guild.tag = tag;

        await guild.save();

        await this.userModel.updateOne({
            _id: userId
        }, {
            $set: {
                guildId: guild._id
            },
            $inc: {
                credits: -this.CREATE_GUILD_CREDITS_COST
            }
        })
        .exec();

        return guild;
    }

    async delete(userId, guildId) {
        let guild = await this.detail(guildId);

        if (!this._isLeader(guild, userId)) {
            throw new ValidationError(`You do not have the authority to disband the guild.`);
        }

        await this.userModel.updateMany({
            guildId
        }, {
            $unset: {
                guildId: undefined
            }
        })
        .exec();

        await this.guildModel.deleteOne({ _id: guildId }).exec();
    }

    async invite(username, guildId, invitedByUserId) {
        let user = await this.userModel.findOne({ 
            username 
        }, {
             username: 1,
             'achievements.rank': 1,
             'achievements.victories': 1,
             'achievements.renown': 1
        }).lean().exec();
        
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

        if (guild.invitees.length >= this.MAX_INVITE_COUNT) {
            throw new ValidationError(`There is a maximum of ${this.MAX_INVITE_COUNT} invitees at one time.`);
        }

        await this.guildModel.updateOne({
            _id: guildId
        }, {
            $push: {
                invitees: userId
            }
        })
        .exec();

        return user;
    }

    async uninvite(userId, guildId, uninvitedByUserId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, uninvitedByUserId) || this._isOfficer(guild, uninvitedByUserId);

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to uninvite users from the guild.`);
        }

        if (!this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user has not been invited to the guild.`);
        }

        await this.guildModel.updateOne({
            _id: guildId
        }, {
            $pull: {
                invitees: userId
            }
        })
        .exec();
    }

    async acceptInvite(userId, guildId) {
        let guild = await this.detail(guildId);

        if (!this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user is not an invitee of this guild.`);
        }

        // Remove all invites to this user for any guild.
        await this.guildModel.updateMany({
            invitees: {
                $in: [userId]
            }
        }, {
            $pull: {
                invitees: userId
            }
        })
        .exec();

        // Add the user to the chosen guild.
        await this.guildModel.updateOne({
            _id: guildId
        }, {
            $push: {
                members: userId
            }
        })
        .exec();

        // Set the user's guild id
        await this.userModel.updateOne({ 
            _id: userId
        }, {
            $set: {
                guildId
            }
        })
        .exec();

        guild.members.push(userId);

        // If maximum members reached, clear pending invites.
        if (this._totalMemberCount(guild) >= this.MAX_MEMBER_COUNT) {
            await this.guildModel.updateOne({
                _id: guildId
            }, {
                $set: {
                    invitees: []
                }
            })
            .exec();
        }
    }

    async declineInvite(userId, guildId) {
        let guild = await this.detail(guildId);

        if (!this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user is not an invitee of this guild.`);
        }

        await this.guildModel.updateOne({
            _id: guildId
        }, {
            $pull: {
                invitees: userId
            }
        })
        .exec();
    }

    async leave(userId, guildId) {
        let guild = await this.detail(guildId);

        if (this._isLeader(guild, userId)) {
            throw new ValidationError(`Cannot leave the guild if you are the leader, promote a new guild leader first.`);
        }

        await this._removeUser(guild, userId);
    }

    async promote(userId, guildId, promotedByUserId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, promotedByUserId)
            || (this._isOfficer(guild, promotedByUserId) && this._isMember(guild, userId));

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to promote this member.`);
        }

        if (this._isOfficer(guild, userId)) {
            // Officer to leader
            await this.guildModel.updateOne({
                _id: guildId,
                'officers': userId
            }, {
                $set: {
                    leader: userId,
                    'officers.$': promotedByUserId
                }
            })
            .exec();
        } else if (this._isMember(guild, userId)) {
            // Member to officer
            await this.guildModel.updateOne({
                _id: guildId
            }, {
                $pull: {
                    members: userId
                },
                $push: {
                    officers: userId
                }
            })
            .exec();
        } else {
            throw new ValidationError(`The user is not a member of this guild.`);
        }
    }

    async demote(userId, guildId, demotedByUserId) {
        let guild = await this.detail(guildId);

        let hasPermission = this._isLeader(guild, demotedByUserId);

        if (!hasPermission) {
            throw new ValidationError(`You do not have the authority to demote this member.`);
        }

        let updateObject = null;

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

        await this.guildModel.updateOne({
            _id: guildId
        }, updateObject)
        .exec();
    }

    async kick(userId, guildId, kickedByUserId) {
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

    async _removeUser(guild, userId) {
        let updateObject = null;

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

        await this.guildModel.updateOne({
            _id: guild._id
        }, updateObject)
        .exec();

        await this.userModel.updateOne({
            _id: userId
        }, {
            $set: {
                guildId: null
            }
        })
        .exec();
    }

    _isLeader(guild, userId) {
        return guild.leader.equals(userId);
    }

    _isOfficer(guild, userId) {
        return guild.officers.find(x => x.equals(userId));
    }

    _isMember(guild, userId) {
        return guild.members.find(x => x.equals(userId));
    }

    _isInvitee(guild, userId) {
        return guild.invitees.find(x => x.equals(userId));
    }

    _totalMemberCount(guild) {
        return 1 + guild.officers.length + guild.members.length;
    }

    async _isUserInAGuild(userId) {
        return await this.userModel.count({
            _id: userId,
            guildId: { $ne: null }
        }).exec() > 0;
    }

    async listUserRanksInGuilds() {
        return await this.userModel.find({
            guildId: { $ne: null }
        }, {
            guildId: 1,
            'achievements.rank': 1
        })
        .lean()
        .exec();
    }

    async getLeaderboard(limit) {
        limit = limit || 10;

        let guilds = await this.guildModel.find({}, {
            name: 1,
            tag: 1,
            leader: 1,
            officers: 1,
            members: 1
        })
        .lean()
        .exec();

        // Calculate the rankings of each guild.
        let users = await this.listUserRanksInGuilds();

        for (let guild of guilds) {
            let usersInGuild = users.filter(x => x.guildId.equals(guild._id));

            guild.totalRank = usersInGuild.reduce((sum, i) => sum + i.achievements.rank, 0);
            guild.memberCount = usersInGuild.length;
        }

        let leaderboard = guilds
                        .sort((a, b) => b.totalRank - a.totalRank)
                        .slice(0, limit);

        for (let i = 0; i < leaderboard.length; i++) {
            leaderboard[i].position = i + 1;
        }

        return {
            leaderboard,
            totalGuilds: guilds.length
        };
    }

};
