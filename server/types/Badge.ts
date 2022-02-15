export interface Badge {
    key: string;
    name: string;
    description: string;
    price: number;
};

export interface UserBadge extends Badge {
    awarded: number;
};
