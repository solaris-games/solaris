import type  {CarrierWaypointActionType} from "./carrierWaypoint";

export type SettingEnabledDisabled = 'enabled'|'disabled';
export type SettingUIType = 'standard'|'compact';
export type SettingVisibility = 'visible'|'hidden';
export type SettingNaturalResources = 'planets'|'single-ring';
export type SettingCarrierLoopType = 'solid'|'dashed';
export type SettingTerritoryStyle = 'disabled'|'marching-square'|'voronoi';
export type SettingObjectScaling = 'default'|'clamped';
export type SettingBlendMode = 'ADD'|'NORMAL';

export type UserGameSettings = {
    interface: {
        audio: SettingEnabledDisabled;
        galaxyScreenUpgrades: SettingEnabledDisabled;
        uiStyle: SettingUIType;
        suggestMentions: SettingEnabledDisabled;
        shiftKeyMentions: SettingEnabledDisabled;
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
        territoryOpacity: number;
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
        },
        naturalResourcesRingOpacity: number;
        objectsDepth: SettingEnabledDisabled;
        galaxyCenterAlwaysVisible: SettingEnabledDisabled;
    },
    carrier: {
        defaultAction: CarrierWaypointActionType;
        defaultAmount: number;
        confirmBuildCarrier: SettingEnabledDisabled;
    },
    star: {
        confirmBuildEconomy: SettingEnabledDisabled;
        confirmBuildIndustry: SettingEnabledDisabled;
        confirmBuildScience: SettingEnabledDisabled;
        confirmBuildWarpGate: SettingEnabledDisabled;
        confirmShipDistribution: SettingEnabledDisabled;
    },
    technical: {
        performanceMonitor: SettingEnabledDisabled;
        fpsLimit: number;
    }
};