const EventEmitter = require('events');
const ValidationError = require('../errors/validation');

function toProperCase(string) {
    return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

module.exports = class UserService extends EventEmitter {
    
    constructor(guildModel, userModel) {
        super();

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
        .lean({ defaults: true })
        .exec();

        for (let guild in guilds) {
            let usersInGuild = users.filter(x => x.guildId.equals(guild._id));

            guild.totalRank = usersInGuild.reduce((sum, i) => sum + i.achievements.rank, 0);
        }

        return guilds.sort((a, b) => b.totalRank - a.totalRank);
    }

    async detail(guildId, withUserInfo = false) {
        let guild = await this.guildModel.find({
            _id: guildId
        })
        .lean({ defaults: true })
        .exec();

        if (withUserInfo) {
            let users = await this.userModel.find({ 
                guildId
            }, {
                username: 1,
                'achievements.rank': 1
            })
            .lean()
            .exec();
    
            guild.leader = users.find(x => x._id.equals(guild.leader));
            guild.officers = users.filter(x => this._isOfficer(guild, x));
            guild.members = users.filter(x => this._isMember(guild, x));
            guild.invitees = users.filter(x => this._isInvitee(guild, x));

            guild.totalRank = users.reduce((sum, i) => sum + i.achievements.rank, 0);
        }

        return guild;
    }

    async create(userId, name, tag) {
        let isUserInAGuild = await this._isUserInAGuild(userId);

        if (isUserInAGuild) {
            throw new ValidationError(`Cannot create a guild if you are already a member in another guild.`);
        }

        name = toProperCase(name.trim());
        tag = tag.trim();

        let existing = await this.guildModel.count({
            name
        }).exec();

        if (existing) {
            throw new ValidationError(`A guild with the same name already exists.`);
        }

        let guild = new this.guildModel();

        guild.leader = userId;
        guild.name = name;
        guild.tag = tag;

        await guild.save();
    }

    async delete(userId, guildId) {
        let guild = await this.detail(guildId);

        if (!this._isLeader(guild, userId)) {
            throw new ValidationError(`You do not have the authority to disband the guild.`);
        }

        await this.userModel.update({
            guildId
        }, {
            $set: {
                guildId: null
            }
        })
        .exec();

        await this.guildModel.deleteOne({ _id: guildId }).exec();
    }

    async invite(userId, guildId, invitedByUserId) {
        let isUserInAGuild = await this._isUserInAGuild(userId);

        if (isUserInAGuild) {
            throw new ValidationError(`Cannot invite this user, the user is already a member of a guild.`);
        }

        let guild = await this.detail(guildId);

        if (!this._isLeader(guild, invitedByUserId) || !this._isOfficer(guild, invitedByUserId)) {
            throw new ValidationError(`You do not have the authority to invite new members to the guild.`);
        }

        if (this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user has already been invited to the guild.`);
        }

        if (guild.invitees.length >= 100) {
            throw new ValidationError(`There is a maximum of 100 invitees at one time.`);
        }

        await this.guildModel.updateOne({
            _id: guildId
        }, {
            $push: {
                invitees: userId
            }
        })
        .exec();
    }

    async uninvite(userId, guildId, uninvitedByUserId) {
        let guild = await this.detail(guildId);

        if (!this._isLeader(guild, uninvitedByUserId) || !this._isOfficer(guild, uninvitedByUserId)) {
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

    async acceptInvite(userId, guildId) {
        let guild = await this.detail(guildId);

        if (!this._isInvitee(guild, userId)) {
            throw new ValidationError(`The user is not an invitee of this guild.`);
        }

        // Remove all invites to this user for any guild.
        await this.guildModel.update({
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

        // If maximum members reached (100), clear pending invites.
        if (this._totalMemberCount(guild) >= 100) {
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

        let updateObject = null;

        if (this._isOfficer(guild, userId)) {
            // Officer to leader
            updateObject = {
                $push: {
                    officers: promotedByUserId
                },
                $pull: {
                    officers: userId
                },
                $set: {
                    leader: userId
                }
            };
        } else if (this._isMember(guild, userId)) {
            // Member to officer
            updateObject = {
                $pull: {
                    members: userId
                },
                $push: {
                    officers: userId
                }
            };
        } else {
            throw new ValidationError(`The user is not a member of this guild.`);
        }

        await this.guildModel.updateOne({
            _id: guildId
        }, updateObject)
        .exec();
    }

    async kick(userId, guildId) {
        let guild = await this.detail(guildId);

        if (this._isLeader(guild, userId)) {
            throw new ValidationError(`Cannot kick the guild leader.`);
        }

        let hasPermission = this._isLeader(guild, promotedByUserId)
            || (this._isOfficer(guild, promotedByUserId) && this._isMember(guild, userId));

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
            _id: guildId
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

};
