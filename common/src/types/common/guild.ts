export const GUILD_ACHIEVEMENT_ICONS = ['victory'] as const;
export type GuildAchievementIcon = typeof GUILD_ACHIEVEMENT_ICONS[number];

export type GuildAchievement = {
    icon: GuildAchievementIcon;
    description: string;
};

export type GuildDataForUser<ID> = {
    _id: ID;
    name: string;
    tag: string;
    achievements: GuildAchievement[];
};