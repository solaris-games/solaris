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