import { readonly, ref } from "vue";
import { defineStore } from "pinia";

export type ConfirmationDialogSettings = {
  titleText: string;
  text: string;
  confirmText: string;
  cancelText: string;
  hideCancelButton: boolean;
  cover: boolean;
  additionalParagraphs: string[];
  onConfirm: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
};

export const useConfirmationDialogStore = defineStore(
  "confirmationDialog",
  () => {
    const dialogSettings = ref<ConfirmationDialogSettings | null>(null);

    const setDialogSettings = (settings: ConfirmationDialogSettings) => {
      dialogSettings.value = settings;
    };

    const clearDialogSettings = () => {
      dialogSettings.value = null;
    };

    return {
      dialogSettings: dialogSettings,
      setDialogSettings,
      clearDialogSettings,
    };
  },
);
