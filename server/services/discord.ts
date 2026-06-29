import { ValidationError } from "@solaris/common";
import { Client, GatewayIntentBits, Partials, TextChannel } from "discord.js";
import Repository from "./repository";
import { Config } from "../config/types/Config";
import { User } from "./types/User";
import { logger } from "../utils/logging";

const log = logger("Discord Service");

export default class DiscordService {
    config: Config;
    userRepo: Repository<User>;

    client: Client | null = null;

    constructor(config: Config, userRepo: Repository<User>) {
        this.config = config;
        this.userRepo = userRepo;
    }

    async initialize() {
        if (!this.config.discord.botToken) {
            return; // Don't initialize the service if there's no token configured.
        }

        try {
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.DirectMessages,
                ],
                partials: [Partials.Channel],
            });

            await this.client.login(this.config.discord.botToken);

            log.info("Discord Initialized");
        } catch (err) {
            log.error(
                err,
                "Failed to initialize Discord — Discord notifications will be unavailable",
            );
            this.client = null;
        }
    }

    isConnected() {
        return this.client != null;
    }

    async isServerMember(discordUserId: string) {
        const guild = await this.client!.guilds.fetch(
            this.config.discord.serverId!,
        );

        try {
            const guildMember = await guild.members.fetch(discordUserId);
            return guildMember != null;
        } catch {
            // fetch() throws DiscordAPIError (404) when the member is not in the guild
            return false;
        }
    }

    async updateOAuth(userId, discordUserId, oauth) {
        if (!this.isConnected()) {
            throw new Error(`The Discord integration is not enabled.`);
        }

        const isServerMember = await this.isServerMember(discordUserId);

        if (!isServerMember) {
            throw new ValidationError(
                `You must be a member of the official Solaris discord server to continue. Please join the server and try again.`,
            );
        }

        await this.userRepo.updateOne(
            {
                _id: userId,
            },
            {
                $set: {
                    "oauth.discord": {
                        userId: discordUserId,
                        token: {
                            access_token: oauth.access_token,
                            token_type: oauth.token_type,
                            expires_in: oauth.expires_in,
                            refresh_token: oauth.refresh_token,
                            scope: oauth.scope,
                        },
                    },
                },
            },
        );

        const user = await this.client!.users.fetch(discordUserId);

        await user.send(
            `Hello there, you've just connected your Solaris account to Discord!\r\n\r\nWe'll start sending notifications to you for in-game events. To change your subscriptions, head over to your user account page.`,
        );
    }

    async clearOAuth(userId) {
        await this.userRepo.updateOne(
            {
                _id: userId,
            },
            {
                $set: {
                    "oauth.discord": null,
                },
            },
        );
    }

    async sendMessageByUserId(discordUserId: string, messageTemplate: any) {
        const duser = await this.client!.users.fetch(discordUserId);

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
                embeds: [messageTemplate],
            });
        } catch (err) {
            log.error(err);
        }
    }

    async sendMessageOAuth(user: User, messageTemplate: any) {
        if (
            !this.isConnected() ||
            !user.oauth.discord ||
            !user.oauth.discord.userId
        ) {
            return;
        }

        await this.sendMessageByUserId(
            user.oauth.discord.userId,
            messageTemplate,
        );
    }

    async sendMessageByChannel(channelId: string, messageTemplate: any) {
        const channel = await this.client!.channels.fetch(channelId);

        if (!channel || !(channel instanceof TextChannel)) {
            return;
        }

        try {
            await channel.send({
                embeds: [messageTemplate],
            });
        } catch (err) {
            log.error(err);
        }
    }
}
