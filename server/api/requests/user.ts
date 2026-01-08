import {
    CarrierWaypointActionType,
    CarrierWaypointActionTypes,
    GameSettingEnabledDisabled, number, numberAdv, SettingBlendMode, SettingCarrierLoopType, SettingNaturalResources,
    SettingObjectScaling,
    SettingTerritoryStyle,
    SettingUIType, SettingVisibility,
    stringEnumeration,
    UserGameSettings,
    ValidationError
} from "solaris-common";
import { keyHasBooleanValue, keyHasStringValue } from "./helpers";
import {email, object, password, string, stringValue, username, Validator} from "solaris-common";

export interface UserCreateUserRequest {
    email: string;
    username: string;
    password: string;
};

export const parseCreateUserRequest: Validator<UserCreateUserRequest> = object({
    email: email,
    username: username,
    password: password,
});

export interface UserUpdateEmailPreferenceRequest {
    enabled: boolean;
};

export const mapToUserUpdateEmailPreferenceRequest = (body: any): UserUpdateEmailPreferenceRequest => {
    let errors: string[] = [];

    if (!keyHasBooleanValue(body, 'enabled')) {
        errors.push('Enabled is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        enabled: body.enabled
    }
};

export interface UserUpdateUsernameRequest {
    username: string;
};

export const parseUserUpdateUserNameRequest: Validator<UserUpdateUsernameRequest> = object({
    username: username,
});

export interface UserUpdateEmailRequest {
    email: string;
};

export const parseUserUpdateEmailRequest: Validator<UserUpdateEmailRequest> = object({
    email: email,
});

export interface UserUpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
};

export const parseUserUpdatePasswordRequest: Validator<UserUpdatePasswordRequest> = object({
    currentPassword: string,
    newPassword: password,
});

export interface UserRequestPasswordResetRequest {
    email: string;
};

export const mapToUserRequestPasswordResetRequest = (body: any): UserRequestPasswordResetRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'email')) {
        errors.push('Email is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        email: body.email
    }
};

export interface UserResetPasswordResetRequest {
    token: string;
    newPassword: string;
};

export const mapToUserResetPasswordResetRequest = (body: any): UserResetPasswordResetRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'token')) {
        errors.push('Token is required.');
    }

    if (!keyHasStringValue(body, 'newPassword')) {
        errors.push('New Password is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        token: body.token,
        newPassword: body.newPassword
    }
};

export interface UserRequestUsernameRequest {
    email: string;
};

export const mapToUserRequestUsernameRequest = (body: any): UserRequestUsernameRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'email')) {
        errors.push('Email is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        email: body.email
    }
};

const enabledDisabled = stringEnumeration<GameSettingEnabledDisabled, GameSettingEnabledDisabled[]>(['enabled', 'disabled']);

const colour = stringValue({
    matches: /#[A-Fa-f0-9]{6}/,
});

export const parseUpdateSettingsRequest: Validator<UserGameSettings> = object({
    interface: object({
        audio: enabledDisabled,
        galaxyScreenUpgrades: enabledDisabled,
        uiStyle: stringEnumeration<SettingUIType, SettingUIType[]>(['compact', 'standard']),
        suggestMentions: enabledDisabled,
        shiftKeyMentions: enabledDisabled,
    }),
    guild: object({
        displayGuildTag: stringEnumeration<SettingVisibility, SettingVisibility[]>(['visible', 'hidden'])
    }),
    map: object({
        naturalResources: stringEnumeration<SettingNaturalResources, SettingNaturalResources[]>(['planets', 'single-ring']),
        carrierLoopStyle: stringEnumeration<SettingCarrierLoopType, SettingCarrierLoopType[]>(['solid', 'dashed']),
        carrierPathWidth: numberAdv({
            sign: 'positive',
        }),
        carrierPathDashLength: numberAdv({
            sign: 'positive',
        }),
        territoryStyle: stringEnumeration<SettingTerritoryStyle, SettingTerritoryStyle[]>(['disabled', 'marching-square', 'voronoi']),
        territoryOpacity: numberAdv({
            sign: 'positive',
            range: {
                from: 0,
                to: 1,
            }
        }),
        marchingSquareGridSize: numberAdv({
            range: {
                from: 2,
                to: 32,
            },
            integer: true,
        }),
        marchingSquareTerritorySize: numberAdv({
            range: {
                from: 2,
                to: 32,
            },
            integer: true,
        }),
        marchingSquareBorderWidth: numberAdv({
            range: {
                from: 0,
                to: 8,
            },
            integer: true,
        }),
        voronoiCellBorderWidth: numberAdv({
            range: {
                from: 0,
                to: 5,
            },
            integer: true,
        }),
        voronoiTerritoryBorderWidth: numberAdv({
            range: {
                from: 0,
                to: 8,
            },
            integer: true,
        }),
        objectsScaling: stringEnumeration<SettingObjectScaling, SettingObjectScaling[]>(['default', 'clamped']),
        objectsMinimumScale: numberAdv({
            range: {
                from: 0,
                to: 32,
            },
            integer: true,
        }),
        objectsMaximumScale: numberAdv({
            range: {
                from: 12,
                to: 128,
            },
            integer: true,
        }),
        antiAliasing: enabledDisabled,
        background: object({
            nebulaFrequency: numberAdv({
                range: {
                    from: 0,
                    to: 16,
                },
                integer: true,
            }),
            nebulaDensity: numberAdv({
                range: {
                    from: 0,
                    to: 16,
                },
                integer: true,
            }),
            nebulaOpacity: numberAdv({
                range: {
                    from: 0,
                    to: 1,
                },
            }),
            moveNebulas: enabledDisabled,
            nebulaMovementSpeed: numberAdv({
                range: {
                    from: 0,
                    to: 2,
                },
            }),
            starsOpacity: numberAdv({
                range: {
                    from: 0,
                    to: 1,
                },
            }),
            blendMode: stringEnumeration<SettingBlendMode, SettingBlendMode[]>(['ADD', 'NORMAL']),
            nebulaColour1: colour,
            nebulaColour2: colour,
            nebulaColour3: colour,
        }),
        zoomLevels: object({
            territories: number,
            playerNames: number,
            carrierShips: number,
            star: object({
                shipCount: number,
                name: number,
                naturalResources: number,
                infrastructure: number,
            }),
            background: object({
                nebulas: number,
                stars: number,
            }),
        }),
        naturalResourcesRingOpacity: numberAdv({
            range: {
                from: 0,
                to: 1,
            },
        }),
        objectsDepth: enabledDisabled,
        galaxyCenterAlwaysVisible: enabledDisabled,
    }),
    carrier: object({
        defaultAction: stringEnumeration<CarrierWaypointActionType, CarrierWaypointActionType[]>(CarrierWaypointActionTypes),
        defaultAmount: numberAdv({
            integer: true,
        }),
        confirmBuildCarrier: enabledDisabled,
    }),
    star: object({
        confirmBuildEconomy: enabledDisabled,
        confirmBuildIndustry: enabledDisabled,
        confirmBuildScience: enabledDisabled,
        confirmBuildWarpGate: enabledDisabled,
        confirmShipDistribution: enabledDisabled,
    }),
    technical: object({
        performanceMonitor: enabledDisabled,
        fpsLimit: numberAdv({
            integer: true,
            range: {
                from: 0,
                to: 240,
            },
        }),
    }),
});
