import { DependencyContainer } from "../../services/types/DependencyContainer";
import { logger } from "../../utils/logging";
import { default as axios, AxiosError } from "axios";
import { parseAuthLoginRequest } from "../requests/auth";

const log = logger("Auth Controller");

export default (container: DependencyContainer) => {
    return {
        login: async (req, res, next) => {
            try {
                const body = parseAuthLoginRequest(req.body);

                const user = await container.authService.login(
                    body.email,
                    body.password,
                );

                // Store the user in the session.
                container.sessionService.initialiseSession(req.session, user);

                res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    roles: user.roles,
                    credits: user.credits,
                });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        logout: async (req, res, next) => {
            try {
                if (req.session) {
                    await container.sessionService.destroySession(req.session);
                }

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        verify: (req, res, next) => {
            const session = (req as any).session;

            res.status(200).json({
                _id: session.userId,
                username: session.username,
                roles: session.roles,
                credits: session.userCredits,
            });
            return next();
        },
        authoriseDiscord: async (req: any, res, next) => {
            const code = req.query.code;

            if (code) {
                try {
                    await container.discordService.clearOAuth(
                        req.session.userId,
                    );

                    // Documentation: https://discordjs.guide/oauth2/#a-quick-example
                    const params = new URLSearchParams({
                        client_id: process.env.DISCORD_CLIENTID,
                        client_secret: process.env.DISCORD_CLIENT_SECRET,
                        code,
                        grant_type: "authorization_code",
                        redirect_uri: process.env.DISCORD_OAUTH_REDIRECT_URI,
                        scope: "identify",
                    } as any);

                    const oauthResult = await axios.post(
                        "https://discord.com/api/oauth2/token",
                        params,
                        {
                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded",
                            },
                        },
                    );

                    if (oauthResult.status === 200) {
                        const userResult = await axios.get(
                            "https://discord.com/api/users/@me",
                            {
                                headers: {
                                    authorization: `${oauthResult.data.token_type} ${oauthResult.data.access_token}`,
                                },
                            },
                        );

                        if (userResult.status === 200) {
                            await container.discordService.updateOAuth(
                                req.session.userId,
                                userResult.data.id,
                                oauthResult.data,
                            );

                            res.redirect(
                                `${process.env.CLIENT_URL_ACCOUNT_SETTINGS}?discordSuccess=true`,
                            );
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

            res.redirect(
                `${process.env.CLIENT_URL_ACCOUNT_SETTINGS}?discordSuccess=false`,
            );
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
        },
    };
};
