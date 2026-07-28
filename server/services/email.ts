import { DBObjectId } from "./types/DBObjectId";
import { Config } from "../config/types/Config";
import { EmailTemplate } from "./types/Email";
import { User } from "./types/User";
import GameService from "./game";
import GameStateService from "./gameState";
import { GameTypeService } from "@solaris/common";
import LeaderboardService from "./leaderboard";
import PlayerService from "./player";
import UserService from "./user";
import { Player } from "./types/Player";
import { InternalGameEvent } from "./types/internalEvents/InternalGameEvent";
import PlayerReadyService from "./playerReady";
import { logger } from "../utils/logging";
import { IEmailService } from "./types/IEmailService";
import welcomeEmailHtml from "./emailTemplates/welcomeEmail";
import resetPasswordHtml from "./emailTemplates/resetPassword";
import forgotUsernameHtml from "./emailTemplates/forgotUsername";
import gameWelcomeHtml from "./emailTemplates/gameWelcome";
import gameFinishedHtml from "./emailTemplates/gameFinished";
import gameCycleSummaryHtml from "./emailTemplates/gameCycleSummary";
import yourTurnReminderHtml from "./emailTemplates/yourTurnReminder";
import nextTurnReminderHtml from "./emailTemplates/nextTurnReminder";
import gameTimedOutHtml from "./emailTemplates/gameTimedOut";
import gamePlayerAfkHtml from "./emailTemplates/gamePlayerAfk";
import reviewReminderHtml from "./emailTemplates/reviewReminder";

import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const log = logger("Email Service");

function getFakeTransport() {
    return {
        async sendMail(message) {
            log.info(`SMTP DISABLED`);
            // console.log(message.text);
            // console.log(message.html);
        },
    };
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
/*
    Emails will be sent via a local SMTP server using Postfix.
    See here: https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-as-a-send-only-smtp-server-on-ubuntu-14-04
*/

export class EmailService implements IEmailService {
    TEMPLATES = {
        WELCOME: {
            html: welcomeEmailHtml,
            subject: "Welcome to Solaris",
        },
        RESET_PASSWORD: {
            html: resetPasswordHtml,
            subject: "Reset your Solaris password",
        },
        FORGOT_USERNAME: {
            html: forgotUsernameHtml,
            subject: "Your Solaris username",
        },
        GAME_WELCOME: {
            html: gameWelcomeHtml,
            subject: "Your Solaris game starts soon!",
        },
        GAME_FINISHED: {
            html: gameFinishedHtml,
            subject: "Your Solaris game has ended!",
        },
        GAME_CYCLE_SUMMARY: {
            html: gameCycleSummaryHtml,
            subject: "A galactic cycle has ended - Upgrade your empire!",
        },
        YOUR_TURN_REMINDER: {
            html: yourTurnReminderHtml,
            subject: "Solaris - It's your turn to play!",
        },
        NEXT_TURN_REMINDER: {
            html: nextTurnReminderHtml,
            subject: "Solaris - Turn finished, it's your turn to play!",
        },
        GAME_TIMED_OUT: {
            html: gameTimedOutHtml,
            subject: "Solaris - Your game did not start",
        },
        GAME_PLAYER_AFK: {
            html: gamePlayerAfkHtml,
            subject: "Solaris - You've gone AFK",
        },
        REVIEW_REMINDER_30_DAYS: {
            html: reviewReminderHtml,
            subject: "Solaris - How did we do?",
        },
    };

    config: Config;
    gameService: GameService;
    userService: UserService;
    leaderboardService: LeaderboardService;
    playerService: PlayerService;
    playerReadyService: PlayerReadyService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;

    constructor(
        config: Config,
        gameService: GameService,
        userService: UserService,
        leaderboardService: LeaderboardService,
        playerService: PlayerService,
        playerReadyService: PlayerReadyService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
    ) {
        this.config = config;
        this.gameService = gameService;
        this.userService = userService;
        this.leaderboardService = leaderboardService;
        this.playerService = playerService;
        this.playerReadyService = playerReadyService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
    }

    isEnabled() {
        return this.config.smtp.enabled;
    }

    _getTransport() {
        // If emails are disabled, return a fake transport which
        //outputs the message to the console.
        if (this.isEnabled()) {
            const smtpOptions: SMTPTransport.Options = {
                host: this.config.smtp.host!,
                port: Number.parseInt(this.config.smtp.port!),
                tls: {
                    rejectUnauthorized: false,
                },
                auth: {
                    user: this.config.smtp.username,
                    pass: this.config.smtp.password,
                },
            };
            return nodemailer.createTransport(smtpOptions);
        } else {
            return getFakeTransport();
        }
    }

    async send(toEmail: string, subject: string, text: string) {
        const transport = this._getTransport();

        const message = {
            from: this.config.smtp.from,
            to: toEmail,
            subject,
            text,
        };

        log.info(`EMAIL: [${message.to}] - ${subject}`);

        return await transport.sendMail(message);
    }

    async sendHtml(toEmail: string, subject: string, html: string) {
        const transport = this._getTransport();

        const message = {
            from: this.config.smtp.from,
            to: toEmail,
            subject,
            html,
        };

        log.info(`EMAIL HTML: [${message.to}] - ${subject}`);

        return await transport.sendMail(message);
    }

    async sendTemplate(toEmail: string, template: EmailTemplate, parameters) {
        parameters = parameters || [];

        let html = template.html;

        // Replace the default parameters in the file
        // TODO: These should be environment variables.
        const clientUrl = this.config.clientUrl ?? "";
        html = html.replace("[{solaris_url}]", clientUrl);
        html = html.replace(
            "[{solaris_url_gamelist}]",
            `${clientUrl}/#/game/list`,
        );
        html = html.replace(
            "[{solaris_url_resetpassword}]",
            `${clientUrl}/#/account/reset-password-external`,
        );
        html = html.replace(
            "[{source_code_url}]",
            "https://github.com/solaris-games/solaris",
        );

        // Replace the parameters in the file
        for (let i = 0; i < parameters.length; i++) {
            let parameterString = `[{${i.toString()}}]`;

            html = html.split(parameterString).join(parameters[i].toString());
        }

        return await this.sendHtml(toEmail, template.subject, html);
    }

    async sendWelcomeEmail(user: User) {
        try {
            await this.sendTemplate(user.email, this.TEMPLATES.WELCOME, [
                user.username,
            ]);
        } catch (err) {
            log.error(err);
        }
    }

    async sendReviewReminderEmail(user: User) {
        if (!user.emailOtherEnabled) {
            throw new Error(
                `The user is not subscribed to review reminder emails.`,
            );
        }

        await this.sendTemplate(
            user.email,
            this.TEMPLATES.REVIEW_REMINDER_30_DAYS,
            [user.username],
        );
    }

    async sendGameStartedEmail(args: InternalGameEvent) {
        let game = (await this.gameService.getById(args.gameId))!;
        let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players.filter((p) => p.userId)) {
            await this._trySendEmailToPlayer(
                player,
                this.TEMPLATES.GAME_WELCOME,
                [gameName, gameUrl],
            );
        }
    }

    async sendGameFinishedEmail(gameId: DBObjectId) {
        let game = (await this.gameService.getById(gameId))!;
        let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players.filter((p) => p.userId)) {
            await this._trySendEmailToPlayer(
                player,
                this.TEMPLATES.GAME_FINISHED,
                [gameName, gameUrl],
            );
        }
    }

    async _trySendEmailToPlayer(
        player: Player,
        template: EmailTemplate,
        args: string[],
    ) {
        if (!player.userId) {
            throw new Error(`Cannot send an email to an unknown player.`);
        }

        let user = await this.userService.getEmailById(player.userId!);

        if (user && user.emailEnabled) {
            try {
                await this.sendTemplate(user.email, template, args);
            } catch (err) {
                log.error(err);
            }
        }
    }
}
