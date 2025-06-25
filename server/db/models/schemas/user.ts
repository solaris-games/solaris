const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

import StatsSchema from "./stats";
import BadgeSchema from './badge';

const schema = new Schema({
    username: {type: Types.String, required: true},
    guildId: {type: Types.ObjectId, default: null},
    email: {type: Types.String, required: true},
    emailEnabled: {type: Types.Boolean, default: true},
    emailOtherEnabled: {type: Types.Boolean, default: true},
    password: {type: Types.String, required: false, default: null},
    resetPasswordToken: {type: Types.String, required: false, default: null},
    credits: {type: Types.Number, default: 0},
    premiumEndDate: {type: Types.Date, default: null},
    banned: {type: Types.Boolean, default: false},
    lastSeen: {type: Types.Date, required: false, default: null},
    lastSeenIP: {type: Types.String, required: false, default: null},
    isEstablishedPlayer: {type: Types.Boolean, required: true, default: false},
    hasSentReviewReminder: {type: Types.Boolean, required: true, default: false},
    warnings: [{
        text: {type: Types.String, required: true},
        date: {type: Types.Date, required: true}
    }],
    lastReadAnnouncement: {type: Types.ObjectId, required: false, default: null},
    roles: {
        administrator: {type: Types.Boolean, default: false},
        contributor: {type: Types.Boolean, default: false},
        developer: {type: Types.Boolean, default: false},
        communityManager: {type: Types.Boolean, default: false},
        gameMaster: {type: Types.Boolean, default: false}
    },
    achievements: {
        victories: {type: Types.Number, default: 0},
        victories1v1: {type: Types.Number, default: 0},
        level: {type: Types.Number, default: 1},
        rank: {type: Types.Number, default: 0},
        eloRating: {type: Types.Number, default: null},
        renown: {type: Types.Number, default: 0},
        joined: {type: Types.Number, default: 0},
        completed: {type: Types.Number, default: 0},
        quit: {type: Types.Number, default: 0},
        defeated: {type: Types.Number, default: 0},
        defeated1v1: {type: Types.Number, default: 0},
        afk: {type: Types.Number, default: 0},
        stats: StatsSchema,
        badges: [BadgeSchema],
    },
    gameSettings: {
        interface: {
            audio: {type: Types.String, required: false, enum: ['enabled', 'disabled'], default: 'enabled'},
            galaxyScreenUpgrades: {
                type: Types.String,
                required: false,
                enum: ['enabled', 'disabled'],
                default: 'disabled'
            },
            uiStyle: {type: Types.String, required: false, enum: ['standard', 'compact'], default: 'standard'},
            suggestMentions: {type: Types.String, required: false, enum: ['enabled', 'disabled'], default: 'enabled'}
        },
        guild: {
            displayGuildTag: {type: Types.String, required: false, enum: ['visible', 'hidden'], default: 'visible'},
        },
        map: {
            naturalResources: {
                type: Types.String,
                required: false,
                enum: ['planets', 'single-ring'],
                default: 'single-ring'
            },
            carrierLoopStyle: {type: Types.String, required: false, enum: ['solid', 'dashed'], default: 'dashed'},
            carrierPathWidth: {type: Types.Number, required: false, default: 1, min: 1, max: 8},
            carrierPathDashLength: {type: Types.Number, required: false, default: 6, min: 4, max: 16},
            territoryStyle: {
                type: Types.String,
                required: false,
                enum: ['disabled', 'marching-square', 'voronoi'],
                default: 'marching-square'
            },
            territoryOpacity: {type: Types.Number, required: false, default: 0.333, min: 0, max: 1},
            marchingSquareGridSize: {type: Types.Number, required: false, default: 6, min: 2, max: 32},
            marchingSquareTerritorySize: {type: Types.Number, required: false, default: 5, min: 2, max: 32},
            marchingSquareBorderWidth: {type: Types.Number, required: false, default: 2, min: 0, max: 8},
            voronoiCellBorderWidth: {type: Types.Number, required: false, default: 2, min: 0, max: 5},
            voronoiTerritoryBorderWidth: {type: Types.Number, required: false, default: 4, min: 0, max: 8},
            objectsScaling: {type: Types.String, required: false, enum: ['default', 'clamped'], default: 'default'},
            objectsMinimumScale: {type: Types.Number, required: false, default: 8, min: 0, max: 32},
            objectsMaximumScale: {type: Types.Number, required: false, default: 16, min: 8, max: 128},
            objectsDepth: {type: Types.String, required: false, enum: ['enabled', 'disabled'], default: 'disabled'},
            antiAliasing: {type: Types.String, required: false, enum: ['enabled', 'disabled'], default: 'enabled'},
            background: {
                nebulaFrequency: {type: Types.Number, required: false, default: 12, min: 0, max: 16},
                nebulaDensity: {type: Types.Number, required: false, default: 3, min: 0, max: 8},
                nebulaOpacity: {type: Types.Number, required: false, default: 1.0, min: 0.0, max: 1.0},
                moveNebulas: {type: Types.String, required: false, enum: ['enabled', 'disabled'], default: 'enabled'},
                nebulaMovementSpeed: {type: Types.Number, required: false, default: 1.0, min: 0.0, max: 2.0},
                starsOpacity: {type: Types.Number, required: false, default: 1.0, min: 0.0, max: 1.0},
                blendMode: {type: Types.String, required: false, enum: ['ADD', 'NORMAL'], default: 'NORMAL'},
                nebulaColour1: {type: Types.String, required: false, default: '#FF0000'},
                nebulaColour2: {type: Types.String, required: false, default: '#00FF00'},
                nebulaColour3: {type: Types.String, required: false, default: '#0000FF'}
            },
            zoomLevels: {
                territories: {type: Types.Number, required: false, default: 100},
                playerNames: {type: Types.Number, required: false, default: 100},
                carrierShips: {type: Types.Number, required: false, default: 140},
                star: {
                    shipCount: {type: Types.Number, required: false, default: 120},
                    name: {type: Types.Number, required: false, default: 160},
                    naturalResources: {type: Types.Number, required: false, default: 160},
                    infrastructure: {type: Types.Number, required: false, default: 200}
                },
                background: {
                    nebulas: {type: Types.Number, required: false, default: 100},
                    stars: {type: Types.Number, required: false, default: 100}
                }
            },
            naturalResourcesRingOpacity: {type: Types.Number, required: false, default: 0.1, min: 0.0, max: 1.0},
            galaxyCenterAlwaysVisible: {type: Types.String, required: false, enum: ['enabled', 'disabled'], default: 'disabled'},
        },
        carrier: {
            defaultAction: {
                type: Types.String,
                required: false,
                enum: ['nothing', 'collectAll', 'dropAll', 'collect', 'drop', 'collectAllBut', 'dropAllBut', 'garrison', 'collectPercentage', 'dropPercentage'],
                default: 'collectAll'
            },
            defaultAmount: {type: Types.Number, required: false, default: 0},
            confirmBuildCarrier: {
                type: Types.String,
                required: false,
                enum: ['enabled', 'disabled'],
                default: 'enabled'
            },
        },
        star: {
            confirmBuildEconomy: {
                type: Types.String,
                required: false,
                enum: ['enabled', 'disabled'],
                default: 'disabled'
            },
            confirmBuildIndustry: {
                type: Types.String,
                required: false,
                enum: ['enabled', 'disabled'],
                default: 'disabled'
            },
            confirmBuildScience: {
                type: Types.String,
                required: false,
                enum: ['enabled', 'disabled'],
                default: 'disabled'
            },
            confirmBuildWarpGate: {
                type: Types.String,
                required: false,
                enum: ['enabled', 'disabled'],
                default: 'enabled'
            },
        },
        technical: {
            performanceMonitor: {
                type: Types.String,
                required: false,
                enum: ['enabled', 'disabled'],
                default: 'disabled'
            },
            fpsLimit: { type: Types.Number, required: false, default: 60, min: 0, max: 240 },
        }
    },
    avatars: [{type: Types.Number, required: false}],
    oauth: {
        discord: {
            userId: {type: Types.String, required: false},
            token: {
                access_token: {type: Types.String, required: false},
                token_type: {type: Types.String, required: false},
                expires_in: {type: Types.String, required: false},
                refresh_token: {type: Types.String, required: false},
                scope: {type: Types.String, required: false}
            }
        }
    },
    subscriptions: {
        inapp: {
            notificationsForOtherGames: { type: Types.Boolean, required: false, default: true },
        },
        settings: {
            notifyActiveGamesOnly: {type: Types.Boolean, required: false, default: false} // Send notifications only if the user isn't defeated
        },
        discord: {
            gameStarted: {type: Types.Boolean, required: false, default: true},
            gameEnded: {type: Types.Boolean, required: false, default: true},
            gameTurnEnded: {type: Types.Boolean, required: false, default: true},
            playerGalacticCycleComplete: {type: Types.Boolean, required: false, default: true},
            playerResearchComplete: {type: Types.Boolean, required: false, default: true},
            playerTechnologyReceived: {type: Types.Boolean, required: false, default: true},
            playerCreditsReceived: {type: Types.Boolean, required: false, default: true},
            playerCreditsSpecialistsReceived: {type: Types.Boolean, required: false, default: true},
            playerRenownReceived: {type: Types.Boolean, required: false, default: true},
            conversationMessageSent: {type: Types.Boolean, required: false, default: true}
        }
    },
    tutorialsCompleted: [{type: Types.String, required: false}],
});

export default schema;
