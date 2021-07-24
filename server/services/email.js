const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function getFakeTransport() {
    return {
        async sendMail(message) {
            console.log('-----');
            console.log(`SMTP DISABLED - Attempted to send email to [${message.to}] from [${message.from}]`);
            // console.log(message.text);
            // console.log(message.html);
            console.log('-----');
        }
    };
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   
/*
    Emails will be sent via a local SMTP server using Postfix.
    See here: https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-as-a-send-only-smtp-server-on-ubuntu-14-04
*/

module.exports = class EmailService {

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
        CUSTOM_GAME_REMOVED: {
            fileName: 'customGameRemoved.html',
            subject: 'Solaris - Your game did not start'
        }
    };

    constructor(config, gameService, userService, leaderboardService, playerService) {
        this.config = config;
        this.gameService = gameService;
        this.userService = userService;
        this.leaderboardService = leaderboardService;
        this.playerService = playerService;

        this.gameService.on('onGameStarted', (data) => this.sendGameStartedEmail(data.gameId));
        this.userService.on('onUserCreated', (user) => this.sendWelcomeEmail(user));
        this.playerService.on('onGamePlayerReady', (data) => this.trySendLastPlayerTurnReminder(data.gameId));
    }

    _getTransport() {
        // If emails are disabled, return a fake transport which
        //outputs the message to the console.
        if (this.config.smtp.enabled) {
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

    async send(toEmail, subject, text) {
        const transport = this._getTransport();
        
        const message = {
            from: this.config.smtp.from,
            to: toEmail,
            subject,
            text
        };
        
        return await transport.sendMail(message);
    }

    async sendHtml(toEmail, subject, html) {
        const transport = this._getTransport();
        
        const message = {
            from: this.config.smtp.from,
            to: toEmail,
            subject,
            html
        };
        
        return await transport.sendMail(message);
    }

    async sendTemplate(toEmail, template, parameters) {
        parameters = parameters || [];

        const filePath = path.join(__dirname, '../templates/', template.fileName);
        let html = fs.readFileSync(filePath, { encoding: 'UTF8' });

        // Replace the default parameters in the file
        // TODO: These should be environment variables.
        html = html.replace('[{solaris_url}]', 'https://solaris.games');
        html = html.replace('[{solaris_url_gamelist}]', 'https://solaris.games/#/game/list');
        html = html.replace('[{solaris_url_resetpassword}]', 'https://solaris.games/#/account/reset-password-external');
        html = html.replace('[{source_code_url}]', 'https://github.com/mike-eason/solaris');

        // Replace the parameters in the file
        for (let i = 0; i < parameters.length; i++) {
            let parameterString = `[{${i.toString()}}]`;

            html = html.split(parameterString).join(parameters[i].toString());
        }

        return await this.sendHtml(toEmail, template.subject, html);
    }

    async sendWelcomeEmail(user) {
        try {
            await this.sendTemplate(user.email, this.TEMPLATES.WELCOME, [user.username]);
        } catch (err) {
            console.error(err);
        }
    }

    async sendGameStartedEmail(gameId) {
        let game = await this.gameService.getById(gameId);
        let gameUrl = `https://solaris.games/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players) {
            let user = await this.userService.getEmailById(player.userId);
            
            if (user && user.emailEnabled) {
                try {
                    await this.sendTemplate(user.email, this.TEMPLATES.GAME_WELCOME, [
                        gameName,
                        gameUrl
                    ]);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    async sendGameFinishedEmail(game) {
        let gameUrl = `https://solaris.games/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players) {
            let user = await this.userService.getEmailById(player.userId);
            
            if (user && user.emailEnabled) {
                try {
                    await this.sendTemplate(user.email, this.TEMPLATES.GAME_FINISHED, [
                        gameName,
                        gameUrl
                    ]);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    async sendGameCycleSummaryEmail(game) {      
        let leaderboardReturn = this.leaderboardService.getLeaderboardRankings(game, 'stars');
        let leaderboard = leaderboardReturn.leaderboard;

        let leaderboardHtml = '';

        // Leaderboard is hidden for ultra dark mode games.
        if (!this.gameService.isDarkModeExtra(game)) {
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

        let gameUrl = `https://solaris.games/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        // Send the email only to undefeated players.
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);
        let winConditionText = '';

        switch (game.settings.general.mode) {
            case 'conquest':
                winConditionText = `Winner will be the first to <span style="color:#3498DB;">capture ${game.state.starsForVictory} of ${game.state.stars} stars</span>.`;
                break;
            case 'battleRoyale':
                winConditionText = 'Winner will be the <span style="color:#3498DB;">last man standing</span>.';
                break;
        }

        for (let player of undefeatedPlayers) {
            let user = await this.userService.getEmailById(player.userId);
            
            if (user && user.emailEnabled) {
                try {
                    await this.sendTemplate(user.email, this.TEMPLATES.GAME_CYCLE_SUMMARY, [
                        gameName,
                        gameUrl,
                        winConditionText,
                        leaderboardHtml
                    ]);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    async trySendLastPlayerTurnReminder(gameId) {
        let game = await this.gameService.getById(gameId);

        if (!this.gameService.isTurnBasedGame(game)) {
            throw new Error('Cannot send a last turn reminder for non turn based games.');
        }

        if (!this.gameService.isInProgress(game)) {
            return;
        }

        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated && !p.ready);

        if (undefeatedPlayers.length === 1) {
            let player = undefeatedPlayers[0];

            // If we have already sent a last turn reminder to this player then do not
            // send one again, this prevents players from spamming ready/unready and sending
            // the last player loads of emails.
            if (player.hasSentTurnReminder) {
                return;
            }

            player.hasSentTurnReminder = true;
            await game.save();

            let gameUrl = `https://solaris.games/#/game?id=${game._id}`;
            let gameName = game.settings.general.name;

            let user = await this.userService.getEmailById(player.userId);
            
            if (user && user.emailEnabled) {
                try {                    
                    await this.sendTemplate(user.email, this.TEMPLATES.YOUR_TURN_REMINDER, [
                        gameName,
                        gameUrl
                    ]);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    async sendCustomGameRemovedEmail(gameId) {
        let game = await this.gameService.getById(gameId);
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players) {
            let user = await this.userService.getEmailById(player.userId);
            
            if (user && user.emailEnabled) {
                try {
                    await this.sendTemplate(user.email, this.TEMPLATES.CUSTOM_GAME_REMOVED, [
                        gameName
                    ]);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

};
