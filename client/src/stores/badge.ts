import { computed, readonly, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Badge } from '@solaris-common';
import { formatError, isOk } from '@/services/typedapi';
import { getBadges } from '@/services/typedapi/badge';
import type { Axios } from 'axios';

export const useBadgeStore = defineStore('badge', () => {
    // State
    const badges = ref<Badge[]>([]);
    const isLoaded = ref<boolean>(false);

    // Computed getters
    const purchasableBadges = computed(() => badges.value.filter(b => b.price));

    // Actions
    const loadBadges = async (httpClient: Axios): Promise<Badge[]> => {
        // Return cached data if already loaded
        if (isLoaded.value && badges.value.length) {
            return badges.value;
        }

        const response = await getBadges(httpClient)();
        if (isOk(response)) {
            badges.value = response.data;
            isLoaded.value = true;
            return response.data;
        } else {
            console.error(formatError(response));
            return [];
        }
    };

    const clearBadges = () => {
        badges.value = [];
        isLoaded.value = false;
    };

    return {
        // State (readonly)
        badges: readonly(badges),
        isLoaded: readonly(isLoaded),

        // Computed getters
        purchasableBadges,

        // Actions
        loadBadges,
        clearBadges,
    };
});
