import type { Socket } from "socket.io-client";
import type { InjectionKey } from "vue";

export const socketInjectionKey: InjectionKey<Socket> = Symbol('socket');
