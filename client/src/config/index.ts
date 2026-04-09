import type {FrontendConfig} from "@solaris/common";
import type { InjectionKey } from "vue";

export const configInjectionKey: InjectionKey<FrontendConfig> = Symbol('config');
