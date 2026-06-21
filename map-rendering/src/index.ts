// Core container
export { createGameContainer, GameContainer } from './container';
export type { DrawingContext, TooltipService, TooltipData, Services } from './container';

// Texture URLs type (consumers must provide their own texture URLs)
export type { TextureUrls } from './texture';

// Event bus
export type { EventBus } from './eventBus';
export type { EventBusEventName } from './eventBusEventNames/eventBusEventName';

// Map event names (the map's communication contract with consuming apps)
export { default as MapEventBusEventNames } from './eventBusEventNames/map';
export { default as MapCommandEventBusEventNames } from './eventBusEventNames/mapCommand';
export { default as GameCommandEventBusEventNames } from './eventBusEventNames/gameCommand';

// Event payload types
export type { ObjectClicked, StarClickDispatchArgs } from './eventBusEventNames/map';

// Domain types used in event payloads and public API
export type { Game, Player, Star, Carrier } from './types/game';
export type { TempWaypoint } from './types/waypoint';
export type { RulerPoint } from './types/ruler';

// Map mode type (needed by consumers using MapCommandSetMode)
export { ModeKind } from './map';
export type { Mode, ModeGalaxy, ModeWaypoints, ModeRuler } from './map';
