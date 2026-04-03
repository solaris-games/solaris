import { useConfirmationDialogStore, type ConfirmationDialogSettings } from '@/stores/confirmationDialog.ts';

declare var bootstrap: any;

export const useConfirm = () => {
  const confirmStore = useConfirmationDialogStore();

  return (title: string, text: string, confirmText = 'Yes', cancelText = 'No', hideCancelButton = false, cover = false): Promise<boolean> => {
    return new Promise((resolve) => {
      const settings: ConfirmationDialogSettings = {
        confirmText: confirmText || 'Yes',
        cancelText: cancelText || 'No',
        hideCancelButton: Boolean(hideCancelButton),
        cover: Boolean(cover),
        titleText: title,
        text,
        onConfirm: async () => {
          await close()
          resolve(true)
        },
        onCancel: async () => {
          await close()
          resolve(false)
        }
      }

      confirmStore.setDialogSettings(settings);

      const $modalElement = document.getElementById("confirmModal");

      if (!$modalElement) {
        console.error('confirmModal element not found in DOM');
        resolve(false);
        return;
      }

      // @ts-ignore
      const modal = new bootstrap.Modal($modalElement, {})

      const close = async () => {
        modal.toggle()
        await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 400));
      }

      modal.toggle()
    })
  }
}
