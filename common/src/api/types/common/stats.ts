export type Statistics = {
    combat: {
        kills: {
            ships: number;
            carriers: number;
            specialists: number;
        },
        losses: {
            ships: number;
            carriers: number;
            specialists: number;
        },
        stars: {
            captured: number;
            lost: number;
        },
        homeStars: {
            captured: number;
            lost: number;
        }
    },
    infrastructure: {
        economy: number;
        industry: number;
        science: number;
        warpGates: number;
        warpGatesDestroyed: number;
        carriers: number;
        specialistsHired: number;
    },
    research: {
        scanning: number;
        hyperspace: number;
        terraforming: number;
        experimentation: number;
        weapons: number;
        banking: number;
        manufacturing: number;
        specialists: number;
    },
    trade: {
        creditsSent: number;
        creditsReceived: number;
        creditsSpecialistsSent: number;
        creditsSpecialistsReceived: number;
        technologySent: number;
        technologyReceived: number;
        giftsSent: number;
        giftsReceived: number;
        renownSent: number;
    },
}