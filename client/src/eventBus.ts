import type { InjectionKey } from "vue";
import type { EventBus } from "@solaris/map-rendering";

export type { EventBus };

export const eventBusInjectionKey: InjectionKey<EventBus> = Symbol("EventBus");
