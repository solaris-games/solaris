export interface Avatar {
    id: number;
    name: string;
    description: string;
    price: number;
};

export interface UserAvatar extends Avatar {
    purchased: boolean;
};
