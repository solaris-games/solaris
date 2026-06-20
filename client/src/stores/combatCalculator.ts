import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { CCGroup } from '@/views/game/components/combatcalculator/types';

export const useCombatCalculatorStore = defineStore('combatCalculator', () => {
    const groups = ref<CCGroup[]>([]);

    const addGroup = () => {
        groups.value.push({
            name: `Group ${groups.value.length + 1}`,
            star: undefined,
            carriers: [],
            weapons: { kind: 'level', level: 1 },
        });
    };

    const removeGroup = (group: CCGroup) => {
        const index = groups.value.indexOf(group);
        if (index !== -1) {
            groups.value.splice(index, 1);
        }
    };

    const reset = () => {
        groups.value = [];
    };

    return {
        groups,
        addGroup,
        removeGroup,
        reset,
    };
});
