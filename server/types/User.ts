import { ObjectId } from "mongoose";
import { CarrierWaypointActionType } from "./CarrierWaypoint";

export type SettingEnabledDisabled = 'enabled'|'disabled';
export type SettingUIType = 'standard'|'compact';
export type SettingVisibility = 'visible'|'hidden';
export type SettingNaturalResources = 'planets'|'single-ring';
export type SettingCarrierLoopType = 'solid'|'dashed';
export type SettingTerritoryStyle = 'disabled'|'marching-square'|'voronoi';
export type SettingObjectScaling = 'default'|'clamped';
export type SettingBlendMode = 'ADD'|'NORMAL';

export interface User {
    _id: ObjectId;
    username: string;
    guildId: ObjectId | null;
    email: string;
    emailEnabled: boolean;
    password: string | null;
    resetPasswordToken: string | null;
    credits: number;
    premiumEndDate: Date;
    banned: boolean;
    lastSeen: Date | null;
    lastSeenIP: string | null;
    roles: {
        administrator: boolean;
        contributor: boolean;
        developer: boolean;
        communityManager: boolean;
        gameMaster: boolean;
    },
    achievements: {
        victories: number;
        rank: number;
        eloRating: number | null;
        renown: number;
        joined: number;
        completed: number;
        quit: number;
        defeated: number;
        afk: number;
        combat: {
            kills: {
                ships: number;
                carriers: number;
                specialists: number;
            },
            losses: {
                ships: number;
                carriers: number;
                specialists: number;
            },
            stars: {
                captured: number;
                lost: number;
            },
            homeStars: {
                captured: number;
                lost: number;
            }
        },
        infrastructure: {
            economy: number;
            industry: number;
            science: number;
            warpGates: number;
            warpGatesDestroyed: number;
            carriers: number;
            specialistsHired: number;
        },
        research: {
            scanning: number;
            hyperspace: number;
            terraforming: number;
            experimentation: number;
            weapons: number;
            banking: number;
            manufacturing: number;
            specialists: number;
        },
        trade: {
            creditsSent: number;
            creditsReceived: number;
            creditsSpecialistsSent: number;
            creditsSpecialistsReceived: number;
            technologySent: number;
            technologyReceived: number;
            giftsSent: number;
            giftsReceived: number;
            renownSent: number;
        },
        badges: {
            ally: number;
            enemy: number;
            diplomat: number;
            strategist: number;
            roleplay: number;
            dauntless: number;
            sleepless: number;
        }
    },
    gameSettings: {
        interface: {
            audio: SettingEnabledDisabled;
            galaxyScreenUpgrades: SettingEnabledDisabled;
            uiStyle: SettingUIType;
            suggestMentions: SettingEnabledDisabled;
        },
        guild: {
            displayGuildTag: SettingVisibility;
        },
        map: {
            naturalResources: SettingNaturalResources;
            carrierLoopStyle: SettingCarrierLoopType;
            carrierPathWidth: number;
            carrierPathDashLength: number;
            territoryStyle: SettingTerritoryStyle;
            marchingSquareGridSize: number;
            marchingSquareTerritorySize: number;
            marchingSquareBorderWidth: number;
            voronoiCellBorderWidth: number;
            voronoiTerritoryBorderWidth: number;
            objectsScaling: SettingObjectScaling;
            objectsMinimumScale: number;
            objectsMaximumScale: number;
            antiAliasing: SettingEnabledDisabled;
            background:{
              nebulaFrequency: number;
              nebulaDensity: number;
              nebulaOpacity: number;
              moveNebulas: SettingEnabledDisabled;
              nebulaMovementSpeed: number;
              starsOpacity: number;
              blendMode: SettingBlendMode;
              nebulaColour1: string;
              nebulaColour2: string;
              nebulaColour3: string;
            },
            zoomLevels: {
              territories: number;
              playerNames: number;
              carrierShips: number;
              star: {
                shipCount: number;
                name: number;
                naturalResources: number;
                infrastructure: number;
              },
              background: {
                nebulas: number;
                stars: number;
              }
            }
        },
        carrier: {
            defaultAction: CarrierWaypointActionType;
            defaultAmount: number;
            confirmBuildCarrier: SettingEnabledDisabled;
        }
    },
    avatars: number[];

    isEstablishedPlayer?: boolean;
};
