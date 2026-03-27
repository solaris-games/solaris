import { readonly, ref } from 'vue';
import { defineStore } from 'pinia';

export type ConfirmationDialogSettings = {
    titleText: string;
    text: string;
    confirmText: string;
    cancelText: string;
    hideCancelButton: boolean;
    cover: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void | Promise<void>;
};

export const useConfirmationDialogStore = defineStore('confirmationDialog', () => {
    // State - null when no dialog is active
    const dialogSettings = ref<ConfirmationDialogSettings | null>(null);

    // Actions
    const setDialogSettings = (settings: ConfirmationDialogSettings) => {
        dialogSettings.value = settings;
    };

    const clearDialogSettings = () => {
        dialogSettings.value = null;
    };

    return {
        // State (readonly)
        dialogSettings: readonly(dialogSettings),

        // Actions
        setDialogSettings,
        clearDialogSettings,
    };
});
