import type {CarrierWaypoint} from "@solaris-common";

export type GalaxyMenuState =
  | 'empires'
  | 'stars'
  | 'carriers'
  | 'ships'
  | 'technology';

export type ReportPlayerArgs = {
  playerId: string,
  messageId?: string,
  conversationId?: string,
};

export type MenuState =
  | { state: 'none' }
  | { state: 'welcome' }
  | { state: 'tutorial' }
  | { state: 'leaderboard' }
  | { state: 'research' }
  | { state: 'galaxy', menu: GalaxyMenuState | undefined }
  | { state: 'intel', compareWithPlayerId?: string }
  | { state: 'options' }
  | { state: 'eventLog' }
  | { state: 'combatCalculator', carrierId?: string }
  | { state: 'player', playerId: string }
  | { state: 'trade', playerId: string }
  | { state: 'starDetail', starId: string }
  | { state: 'buildCarrier', starId: string }
  | { state: 'carrierDetail', carrierId: string }
  | { state: 'carrierWaypoints', carrierId: string }
  | { state: 'carrierWaypointDetail', carrierId: string; waypoint: CarrierWaypoint<string> }
  | { state: 'carrierRename', carrierId: string }
  | { state: 'shipTransfer', carrierId: string }
  | { state: 'bulkInfrastructureUpgrade' }
  | { state: 'ruler' }
  | { state: 'ledger' }
  | { state: 'diplomacy' }
  | { state: 'hireSpecialistCarrier'; carrierId: string }
  | { state: 'hireSpecialistStar'; starId: string }
  | { state: 'gameNotes' }
  | { state: 'playerBadgeShop', recipientPlayerId: string }
  | { state: 'reportPlayer', args: ReportPlayerArgs }
  | { state: 'spectators' }
  | { state: 'statistics' };

export type MenuStateChat =
  | { state: 'none' }
  | { state: 'inbox' }
  | { state: 'conversation', conversationId: string }
  | { state: 'createConversation', participantIds: string[] };
