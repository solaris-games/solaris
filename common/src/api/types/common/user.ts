export type UserWarning = {
    text: string,
    date: Date,
}

export type UserRoles = {
    administrator: boolean;
    contributor: boolean;
    developer: boolean;
    communityManager: boolean;
    gameMaster: boolean;
};

export type AwardedBadge<ID> = {
    badge: string;
    awardedBy: ID | null;
    awardedByName: string | null;
    awardedInGame: ID | null;
    awardedInGameName: string | null;
    playerAwarded: boolean;
    time: Date | null;
}