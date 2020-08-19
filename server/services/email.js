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
        }
    };

    constructor(config, gameService, gameTickService, userService, leaderboardService) {
        this.config = config;
        this.gameService = gameService;
        this.gameTickService = gameTickService;
        this.userService = userService;
        this.leaderboardService = leaderboardService;

        this.gameService.on('onGameStarted', (data) => this.sendGameStartedEmail(data.game));
        this.gameTickService.on('onGameEnded', (data) => this.sendGameFinishedEmail(data.game));
        this.gameTickService.on('onGameGalacticCycleTicked', (data) => this.sendGameCycleSummaryEmail(data.game));
        this.userService.on('onUserCreated', (user) => this.sendWelcomeEmail(user));
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

    async sendGameStartedEmail(game) {
        let gameUrl = `https://solaris.games/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        for (let player of game.galaxy.players) {
            let user = await this.userService.getEmailById(player.userId);
            
            if (user.emailEnabled) {
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
            
            if (user.emailEnabled) {
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
        let leaderboard = this.leaderboardService.getLeaderboardRankings(game);

        let leaderboardHtml = leaderboard.map(l => {
            return `
                <tr>
                    <td><span style="color:#F39C12">${l.player.alias}</span></td>
                    <td>${l.stats.totalStars} Stars</td>
                    <td>${l.stats.totalShips} Ships in ${l.stats.totalCarriers} Carriers</td>
                </tr>
            `;
        })
        .join('');

        let gameUrl = `https://solaris.games/#/game?id=${game._id}`;
        let gameName = game.settings.general.name;

        // Send the email only to undefeated players.
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);

        for (let player of undefeatedPlayers) {
            let user = await this.userService.getEmailById(player.userId);
            
            if (user.emailEnabled) {
                try {
                    await this.sendTemplate(user.email, this.TEMPLATES.GAME_CYCLE_SUMMARY, [
                        gameName,
                        gameUrl,
                        game.state.starsForVictory.toString(),
                        game.state.stars.toString(),
                        leaderboardHtml
                    ]);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

};
