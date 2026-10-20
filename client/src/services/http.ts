import type { InjectionKey } from "vue";
import type { Axios } from "axios";

export const httpInjectionKey: InjectionKey<Axios> = Symbol("httpClient");
