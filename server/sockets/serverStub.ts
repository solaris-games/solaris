import type { Server } from "socket.io";

export const serverStub = { on: (...args: any[]) => { }, engine: { on: (...args: any[]) => { } } } as unknown as Server;
