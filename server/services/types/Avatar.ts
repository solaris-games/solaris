export interface Avatar {
    id: number;
    file: string;
    name: string;
    description: string;
    price: number;
};

export interface UserAvatar extends Avatar {
    purchased: boolean;
};
