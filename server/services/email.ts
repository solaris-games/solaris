import { DBObjectId } from "./types/DBObjectId";
import { Config } from "../config/types/Config";
import { EmailTemplate } from "./types/Email";
import { User } from "./types/User";
import GameService from "./game";
import GameStateService from "./gameState";
import GameTickService, { GameTickServiceEvents } from "./gameTick";
import GameTypeService from "./gameType";
import LeaderboardService from "./leaderboard";
import PlayerService from "./player";
import UserService, { UserServiceEvents } from "./user";
import { Player } from "./types/Player";
import GamePlayerAFKEvent from "./types/events/GamePlayerAFK";
import { BaseGameEvent } from "./types/events/BaseGameEvent";
import GameJoinService, { GameJoinServiceEvents } from "./gameJoin";
import PlayerReadyService, { PlayerReadyServiceEvents } from "./playerReady";
import {logger} from "../utils/logging";

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const log = logger("Email Service");

function getFakeTransport() {
    return {
        async sendMail(message) {
            log.info(`SMTP DISABLED`);
            // console.log(message.text);
            // console.log(message.html);
        }
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

export default class EmailService {

    TEMPLATES = {
        WELCOME: {
            fileName: 'welcomeEmail.html',
            subject: 'Welcome to Solaris'
        },
        RESET_PASSWORD: {
            fileName: 'resetPassword.html',
            subject: 'Reset your Solaris password'
        },
        FORGOT_USERNAME: {
            fileName: 'forgotUsername.html',
            subject: 'Your Solaris username'
        },
        GAME_WELCOME: {
            fileName: 'gameWelcome.html',
            subject: 'Your Solaris game starts soon!'
        },
        GAME_FINISHED: {
            fileName: 'gameFinished.html',
            subject: 'Your Solaris game has ended!'
        },
        GAME_CYCLE_SUMMARY: {
            fileName: 'gameCycleSummary.html',
            subject: 'A galactic cycle has ended - Upgrade your empire!'
        },
        YOUR_TURN_REMINDER: {
            fileName: 'yourTurnReminder.html',
            subject: 'Solaris - It\'s your turn to play!'
        },
        NEXT_TURN_REMINDER: {
            fileName: 'nextTurnReminder.html',
            subject: 'Solaris - Turn finished, it\'s your turn to play!'
        },
        GAME_TIMED_OUT: {
            fileName: 'gameTimedOut.html',
            subject: 'Solaris - Your game did not start'
        },
        GAME_PLAYER_AFK: {
            fileName: 'gamePlayerAfk.html',
            subject: 'Solaris - You\'ve gone AFK'
        },
        REVIEW_REMINDER_30_DAYS: {
            fileName: 'reviewReminder.html',
            subject: 'Solaris - How did we do?'
        }
    };

    config: Config;
    gameService: GameService;
    gameJoinService: GameJoinService;
    userService: UserService;
    leaderboardService: LeaderboardService;
    playerService: PlayerService;
    playerReadyService: PlayerReadyService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    gameTickService: GameTickService;

    constructor(
        config: Config,
        gameService: GameService,
        gameJoinService: GameJoinService,
        userService: UserService,
        leaderboardService: LeaderboardService,
        playerService: PlayerService,
        playerReadyService: PlayerReadyService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        gameTickService: GameTickService
    ) {
        this.config = config;
        this.gameService = gameService;
        this.gameJoinService = gameJoinService;
        this.userService = userService;
        this.leaderboardService = leaderboardService;
        this.playerService = playerService;
        this.playerReadyService = playerReadyService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.gameTickService = gameTickService;

        this.gameJoinService.on(GameJoinServiceEvents.onGameStarted, (args) => this.sendGameStartedEmail(args));
        this.userService.on(UserServiceEvents.onUserCreated, (user) => this.sendWelcomeEmail(user));
        this.playerReadyService.on(PlayerReadyServiceEvents.onGamePlayerReady, (data) => this.trySendLastPlayerTurnReminder(data.gameId));

        this.gameTickService.on(GameTickServiceEvents.onGameTurnEnded, (args) => this.trySendNextTurnReminder(args.gameId));
        this.gameTickService.on(GameTickServiceEvents.onPlayerAfk, (args) => this.sendGamePlayerAfkEmail(args));
        this.gameTickService.on(GameTickServiceEvents.onGameEnded, (args) => this.sendGameFinishedEmail(args.gameId));
        this.gameTickService.on(GameTickServiceEvents.onGameCycleEnded, (args) => this.sendGameCycleSummaryEmail(args.gameId));
    }

    isEnabled() {
        return this.config.smtp.enabled
    }

    _getTransport() {
        // If emails are disabled, return a fake transport which
        //outputs the message to the console.
        if (this.isEnabled()) {
            return nodemailer.createTransport({
                host: this.config.smtp.host,
                port: this.config.smtp.port,
                tls: {
                      rejectUnauthorized: false
                }
            });
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
            text
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
            html
        };

        log.info(`EMAIL HTML: [${message.to}] - ${subject}`);

        return await transport.sendMail(message);
    }

    async sendTemplate(toEmail: string, template: EmailTemplate, parameters) {
        parameters = parameters || [];

        const filePath = path.join(__dirname, './emailTemplates/', template.fileName);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Could not find email template with path: ${filePath}`);
        }

        let html = fs.readFileSync(filePath, { encoding: 'UTF8' });

        // Replace the default parameters in the file
        // TODO: These should be environment variables.
        html = html.replace('[{solaris_url}]', this.config.clientUrl);
        html = html.replace('[{solaris_url_gamelist}]', `${this.config.clientUrl}/#/game/list`);
        html = html.replace('[{solaris_url_resetpassword}]', `${this.config.clientUrl}/#/account/reset-password-external`);
        html = html.replace('[{source_code_url}]', 'https://github.com/solaris-games/solaris');

        // Replace the parameters in the file
        for (let i = 0; i < parameters.length; i++) {
            let parameterString = `[{${i.toString()}}]`;

            html = html.split(parameterString).join(parameters[i].toString());
        }

        return await this.sendHtml(toEmail, template.subject, html);
    }

    async sendWelcomeEmail(user: User) {
        try {
            await this.sendTemplate(user.email, this.TEMPLATES.WELCOME, [user.username]);
        } catch (err) {
            log.error(err);
        }
    }

    async sendReviewReminderEmail(user: User) {
        if (!user.emailOtherEnabled) {
            throw new Error(`The user is not subscribed to review reminder emails.`);
        }

        await this.sendTemplate(user.email, this.TEMPLATES.REVIEW_REMINDER_30_DAYS, [
            user.username
        ]);
    }

    async sendGameStartedEmail(args: BaseGameEvent) {
        let game = (await this.gameService.getById(args.gameId))!;
        let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players.filter(p => p.userId)) {
            await this._trySendEmailToPlayer(player, this.TEMPLATES.GAME_WELCOME, [
                gameName,
                gameUrl
            ]);
        }
    }

    async sendGameFinishedEmail(gameId: DBObjectId) {
        let game = (await this.gameService.getById(gameId))!;
        let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players.filter(p => p.userId)) {
            await this._trySendEmailToPlayer(player, this.TEMPLATES.GAME_FINISHED, [
                gameName,
                gameUrl
            ]);
        }
    }

    async sendGameCycleSummaryEmail(gameId: DBObjectId) {      
        let game = (await this.gameService.getById(gameId))!;
        let leaderboard = this.leaderboardService.getGameLeaderboard(game).leaderboard;

        let leaderboardHtml = '';

        // Leaderboard is hidden for ultra dark mode games.
        if (!this.gameTypeService.isDarkModeExtra(game)) {
            leaderboardHtml = leaderboard.map(l => {
                return `
                    <tr>
                        <td><span style="color:#F39C12">${l.player.alias}</span></td>
                        <td>${l.stats.totalStars} Stars</td>
                        <td>${l.stats.totalShips} Ships in ${l.stats.totalCarriers} Carriers</td>
                    </tr>
                `;
            })
            .join('');
        }

        let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        // Send the email only to undefeated players.
        let undefeatedPlayers = game.galaxy.players.filter((p: Player) => !p.defeated && p.userId);
        let winConditionText = '';

        switch (game.settings.general.mode) {
            case 'conquest':
                switch (game.settings.conquest.victoryCondition) {
                    case 'starPercentage':
                        winConditionText = `Winner will be the first to <span style="color:#3498DB;">capture ${game.state.starsForVictory} of ${game.state.stars} stars</span>.`;
                        break;
                    case 'homeStarPercentage':
                        winConditionText = `Winner will be the first to <span style="color:#3498DB;">capture ${game.state.starsForVictory} capital stars of ${game.settings.general.playerLimit} stars</span>.`;
                        break;
                    default:
                        throw new Error(`Unsupported conquest victory condition: ${game.settings.conquest.victoryCondition}`);
                }
                break;
            case 'battleRoyale':
                winConditionText = 'Winner will be the <span style="color:#3498DB;">last man standing</span>.';
                break;
            case 'kingOfTheHill':
                winConditionText = 'Winner will be the player who <span style="color:#3498DB;">captures and holds</span> the center star.';
                break;
        }

        for (let player of undefeatedPlayers) {
            await this._trySendEmailToPlayer(player, this.TEMPLATES.GAME_CYCLE_SUMMARY, [
                gameName,
                gameUrl,
                winConditionText,
                leaderboardHtml
            ]);
        }
    }

    async trySendLastPlayerTurnReminder(gameId: DBObjectId) {
        let game = (await this.gameService.getById(gameId))!;

        if (!this.gameTypeService.isTurnBasedGame(game)) {
            throw new Error('Cannot send a last turn reminder for non turn based games.');
        }

        if (!this.gameStateService.isInProgress(game)) {
            return;
        }

        const undefeatedPlayers = game.galaxy.players.filter((p: Player) => !p.defeated && p.userId);

        if (undefeatedPlayers.length <= 2) { // No need to send a turn reminder in a 2-player game
            return;
        }

        const undefeatedUnreadyPlayers = undefeatedPlayers.filter(p => !p.ready);

        if (undefeatedUnreadyPlayers.length === 1) {
            let player = undefeatedUnreadyPlayers[0];

            // If we have already sent a last turn reminder to this player then do not
            // send one again, this prevents players from spamming ready/unready and sending
            // the last player loads of emails.
            if (player.hasSentTurnReminder) {
                return;
            }

            await this.playerService.setHasSentTurnReminder(game, player, true);

            let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
            let gameName = game.settings.general.name;

            await this._trySendEmailToPlayer(player, this.TEMPLATES.YOUR_TURN_REMINDER, [
                gameName,
                gameUrl
            ]);
        }
    }

    async trySendNextTurnReminder(gameId: DBObjectId) {
        let game = (await this.gameService.getById(gameId))!;

        // Only send the next turn reminder in TB games and if the game is in progress.
        if (!this.gameTypeService.isTurnBasedGame(game) || !this.gameStateService.isInProgress(game) || this.gameTypeService.isTutorialGame(game)) {
            return;
        }
        
        let undefeatedPlayers = game.galaxy.players.filter((p: Player) => !p.defeated && !p.ready && p.userId);

        let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of undefeatedPlayers) {
            await this._trySendEmailToPlayer(player, this.TEMPLATES.NEXT_TURN_REMINDER, [
                gameName,
                gameUrl
            ]);
        }
    }

    async sendGameTimedOutEmail(gameId: DBObjectId) {
        let game = (await this.gameService.getById(gameId))!;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players.filter(p => p.userId)) {
            await this._trySendEmailToPlayer(player, this.TEMPLATES.GAME_TIMED_OUT, [
                gameName
            ]);
        }
    }

    async sendGamePlayerAfkEmail(args: GamePlayerAFKEvent) {
        let game = (await this.gameService.getById(args.gameId))!;

        // Don't bother sending AFK emails for tutorials.
        if (this.gameTypeService.isTutorialGame(game)) {
            return;
        }

        let player = this.playerService.getById(game, args.playerId!);
        
        if (player && player.userId) {
            let gameUrl = `${this.config.clientUrl}/#/game?id=${game._id}`;
            let gameName = game.settings.general.name;

            await this._trySendEmailToPlayer(player, this.TEMPLATES.GAME_PLAYER_AFK, [
                gameName,
                gameUrl
            ]);
        }
    }

    async _trySendEmailToPlayer(player: Player, template: EmailTemplate, args: string[]) {
        if (!player.userId) {
            throw new Error(`Cannot send an email to an unknown player.`)
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

};
