import { DeleteRoute, GetRoute, PostRoute } from "./index";
import type { UserRoles } from "../../types/common/user";

export type LoginRequest = {
    email: string;
    password: string;
};

export type AuthResponse<ID> = {
    _id: ID;
    username: string;
    roles: UserRoles;
    credits: number;
};

export const createAuthRoutes = <ID>() => ({
    login: new PostRoute<{}, {}, LoginRequest, AuthResponse<ID>>(
        "/api/auth/login",
    ),
    logout: new PostRoute<{}, {}, {}, {}>("/api/auth/logout"),
    verify: new PostRoute<{}, {}, {}, AuthResponse<ID>>("/api/auth/verify"),
    authoriseDiscord: new GetRoute<{}, { code: string }, {}>(
        "/api/auth/discord",
    ),
    unauthoriseDiscord: new DeleteRoute<{}, {}, {}>("/api/auth/discord"),
});
