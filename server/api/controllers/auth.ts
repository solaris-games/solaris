import { DependencyContainer } from '../../services/types/DependencyContainer';
import {logger} from "../../utils/logging";
import { default as axios, AxiosError } from "axios";

const log = logger("Auth Controller");

export default (container: DependencyContainer) => {
    return {
        login: async (req, res, next) => {        
            try {
                let user = await container.authService.login(req.body.email, req.body.password);
        
                // Store the user id in the session.
                req.session.userId = user._id;
                req.session.username = user.username;
                req.session.roles = user.roles;
                req.session.userCredits = user.credits;
                req.session.isImpersonating = false;
    
                res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    roles: user.roles,
                    credits: user.credits
                });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        logout: (req, res, next) => {
            if (req.session) {
                // Delete the session object.
                req.session.destroy((err) => {
                    if (err) {
                        return next(err);
                    }
        
                    res.sendStatus(200);
                    return next();
                });
            } else {
                res.sendStatus(200);
                return next();
            }
        },
        verify: (req, res, next) => {
            const session = (req as any).session;
    
            res.status(200).json({
                _id: session.userId,
                username: session.username,
                roles: session.roles,
                credits: session.userCredits
            });
            return next();
        },
        authoriseDiscord: async (req: any, res, next) => {
            const code = req.query.code;
    
            if (code) {
                try {
                    await container.discordService.clearOAuth(req.session.userId);
    
                    // Documentation: https://discordjs.guide/oauth2/#a-quick-example
                    const params = new URLSearchParams({
                        client_id: process.env.DISCORD_CLIENTID,
                        client_secret: process.env.DISCORD_CLIENT_SECRET,
                        code,
                        grant_type: 'authorization_code',
                        redirect_uri: process.env.DISCORD_OAUTH_REDIRECT_URI,
                        scope: 'identify',
                    } as any);
    
                    const oauthResult = await axios.post('https://discord.com/api/oauth2/token', params, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        }
                    });
    
                    if (oauthResult.status === 200) {
                        const userResult = await axios.get('https://discord.com/api/users/@me', {
                            headers: {
                                authorization: `${oauthResult.data.token_type} ${oauthResult.data.access_token}`,
                            },
                        });
    
                        if (userResult.status === 200) {
                            await container.discordService.updateOAuth(req.session.userId, userResult.data.id, oauthResult.data);
            
                            res.redirect(`${process.env.CLIENT_URL_ACCOUNT_SETTINGS}?discordSuccess=true`);
                            return next();
                        }
                    }
                } catch (error) {
                    // NOTE: An unauthorized token will not throw an error;
                    // it will return a 401 Unauthorized response in the try block above
                    if ((error as Error).name === "AxiosError") {
                        log.error({
                            error,
                            response: (error as AxiosError).response?.data,
                        });
                    } else {
                        log.error(error);
                    }
                }
            }
    
            res.redirect(`${process.env.CLIENT_URL_ACCOUNT_SETTINGS}?discordSuccess=false`);
            return next();
        },
        unauthoriseDiscord: async (req, res, next) => {
            try {
                await container.discordService.clearOAuth(req.session.userId);
        
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
