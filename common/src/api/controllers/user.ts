import {GetRoute, PostRoute} from "./index";
import {LeaderboardUser} from "../types/common/leaderboard";
import {UserGameSettings} from "../types/common/settings";
import {UserSubscriptions} from "../types/common/subscriptions";

export type UserLeaderboard = {
    totalPlayers: number,
    leaderboard: LeaderboardUser<string>[],
}

export type CreateUserReq = {
    email: string;
    username: string;
    password: string;
}

export const createUserRoutes = <ID>() => ({
    listLeaderboard: new GetRoute<{}, UserLeaderboard>("/api/user/leaderboard"),
    createUser: new PostRoute<{}, CreateUserReq, { id: string }>("/api/user/"),
    getSettings: new GetRoute<{}, UserGameSettings>("/api/user/settings"),
    saveSettings: new PostRoute<{}, UserGameSettings, {}>("/api/user/settings"),
    getSubscriptions: new GetRoute<{}, UserSubscriptions>("/api/user/subscriptions"),
    saveSubscriptions: new PostRoute<{}, UserSubscriptions, {}>("/api/user/subscriptions"),
    getCredits: new GetRoute<{}, { credits: number }>("/api/user/credits"),
})