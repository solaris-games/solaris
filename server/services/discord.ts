import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Config } from '../config/types/Config';
import { User } from './types/User';
import {logger} from "../utils/logging";

const Discord = require('discord.js');

const log = logger("Discord Service");

export default class DiscordService {
    config: Config;
    userRepo: Repository<User>;

    client: any = null;
    
    constructor(
        config: Config,
        userRepo: Repository<User>
    ) {
        this.config = config;
        this.userRepo = userRepo;
    }

    async initialize() {
        if (this.config.discord.botToken) { // Don't initialize the service if there's no token configured.
            this.client = new Discord.Client()
            await this.client.login(this.config.discord.botToken);

            log.info('Discord Initialized');
        }
    }

    isConnected() {
        return this.client != null;
    }

    async isServerMember(discordUserId: string) {
        let guild = await this.client.guilds.fetch(this.config.discord.serverId);
        let guildMember = await guild.members.resolveID(discordUserId);

        return guildMember != null;
    }

    async updateOAuth(userId, discordUserId, oauth) {
        if (!this.isConnected()) {
            throw new Error(`The Discord integration is not enabled.`);
        }

        const isServerMember = await this.isServerMember(discordUserId);

        if (!isServerMember) {
            throw new ValidationError(`You must be a member of the official Solaris discord server to continue. Please join the server and try again.`);
        }

        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                'oauth.discord': {
                    userId: discordUserId,
                    token: {
                        access_token: oauth.access_token,
                        token_type: oauth.token_type,
                        expires_in: oauth.expires_in,
                        refresh_token: oauth.refresh_token,
                        scope: oauth.scope
                    }
                }
            }
        });

        const user = await this.client.users.fetch(discordUserId);

        user.send(`Hello there, you've just connected your Solaris account to Discord!\r\n\r\nWe'll start sending notifications to you for in-game events. To change your subscriptions, head over to your user account page.`);
    }

    async clearOAuth(userId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                'oauth.discord': null
            }
        });
    }

    async sendMessageByUserId(discordUserId: string, messageTemplate: any) {
        const duser = await this.client.users.fetch(discordUserId);

        if (!duser) {
            return;
        }

        // We need to double check that the user is a member of the Solaris discord server
        // because if they are not, then we cannot send a PM to them.
        const isServerMember = await this.isServerMember(discordUserId);

        if (!isServerMember) {
            return;
        }

        try {
            await duser.send({
                embed: messageTemplate
            });
        } catch (err) {
            log.error(err);
        }
    }

    async sendMessageOAuth(user: User, messageTemplate: any) {
        if (!this.isConnected() || !user.oauth.discord || !user.oauth.discord.userId) {
            return
        }
        
        await this.sendMessageByUserId(user.oauth.discord.userId, messageTemplate);
    }

    async sendMessageByChannel(channelId: string, messageTemplate: any) {
        const channel = await this.client.channels.fetch(channelId);

        if (!channel) {
            return;
        }

        try {
            await channel.send({
                embed: messageTemplate
            });
        } catch (err) {
            log.error(err);
        }
    }
}