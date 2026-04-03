import { computed, readonly, ref } from 'vue';
import { defineStore } from 'pinia';

export const useTutorialStore = defineStore('tutorial', () => {
    // State
    const currentPage = ref<number>(0);
    const tutorialKey = ref<string>('original');

    // Computed getters
    const isCompleted = computed(() => currentPage.value === -1);
    const tutorialState = computed(() => `${tutorialKey.value}|${currentPage.value}`);

    // Actions
    const setTutorialPage = (page: number) => {
        currentPage.value = page;
    };

    const setTutorialKey = (key: string) => {
        tutorialKey.value = key;
    };

    const setTutorialState = (state: string | number) => {
        if (typeof state === 'string') {
            const parts = state.split('|');
            if (parts.length === 2) {
                tutorialKey.value = parts[0];
                currentPage.value = Number.parseInt(parts[1]);
            }
        } else {
            currentPage.value = state;
        }
    };

    const clearTutorialPage = () => {
        tutorialKey.value = 'original';
        currentPage.value = 0;
    };

    const markCompleted = () => {
        currentPage.value = -1;
    };

    return {
        // State (readonly)
        currentPage: readonly(currentPage),
        tutorialKey: readonly(tutorialKey),

        // Computed getters
        isCompleted,
        tutorialState,

        // Actions
        setTutorialPage,
        setTutorialKey,
        setTutorialState,
        clearTutorialPage,
        markCompleted,
    };
});
