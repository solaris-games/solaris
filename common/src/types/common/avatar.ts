export type BaseAvatar = {
    id: number;
    file: string;
    name: string;
    description: string;
};

export type PurchasableAvatar = BaseAvatar & {
    avatarType: "normal";
    price: number;
    isPatronAvatar: boolean;
};

export type GuildAvatar = BaseAvatar & {
    avatarType: "guild";
};

export type Avatar = PurchasableAvatar | GuildAvatar;

export type UserAvatar = Avatar & {
    unlocked: boolean;
};
