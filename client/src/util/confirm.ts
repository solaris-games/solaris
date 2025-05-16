import { type Store } from 'vuex';
import type {State} from "@/store";

export const makeConfirm = (store: Store<State>) => (title: string, text: string, confirmText = 'Yes', cancelText = 'No', hideCancelButton = false, cover = false) => {
  // @ts-ignore
  const modal = new bootstrap.Modal(window.$('#confirmModal'), {})
  const close = async () => {
    modal.toggle()
    await new Promise((resolve, reject) => setTimeout(resolve, 400));
  }
  return new Promise((resolve, reject) => {
    const settings = {
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
    store.commit('setConfirmationDialogSettings', settings)
    modal.toggle()
  })
}
