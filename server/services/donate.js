const axios = require('axios');

module.exports = class DonateService {

    CACHE_KEY_RECENT_DONATIONS = 'listRecentDonations';

    constructor(cacheService) {
        this.cacheService = cacheService;
    }

    async listRecentDonations(amount) {
        amount = amount || 3;

        let cached = this.cacheService.get(this.CACHE_KEY_RECENT_DONATIONS);

        if (cached) {
            return cached;
        }

        if (!process.env.BUYMEACOFFEE_ACCESS_TOKEN) {
            throw new Error('Buy Me a Coffee Access Token is required.');
        }

        let url = 'https://developers.buymeacoffee.com/api/v1/supporters';

        try {
            let response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.BUYMEACOFFEE_ACCESS_TOKEN}`
                }
            });

            let donators = [];

            if (response.status === 200) {
                donators = response.data.data.map(d => {
                    return {
                        support_id: d.support_id,
                        supporter_name: d.supporter_name,
                        support_note: d.support_note,
                        support_coffees: d.support_coffees,
                        support_created_on: d.support_created_on
                    };
                });
            }

            donators = donators.slice(0, amount);

            this.cacheService.put(this.CACHE_KEY_RECENT_DONATIONS, donators, 3600000); // 1 hour

            return donators;
        } catch (err) {
            console.error(err);

            throw new Error('An error occurred fetching recent donations. Please try again later.');
        }
    }
};
