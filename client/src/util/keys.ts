import type { InjectionKey } from "vue";
import { type ToastPluginApi } from "vue-toast-notification"

export const toastInjectionKey: InjectionKey<ToastPluginApi> = Symbol('toast');
