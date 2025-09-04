import mitt, { type Emitter, type Handler } from 'mitt';

export class EventEmitter<EventType extends string, Ev extends Record<EventType, unknown>> {
  ev: Emitter<Ev>;

  constructor() {
    this.ev = mitt();
  }

  on<K extends EventType>(event: K, handler: Handler<Ev[K]>) {
    this.ev.on(event, handler);
  }

  off<K extends EventType>(event: K, handler: Handler<Ev[K]>) {
    this.ev.off(event, handler);
  }

  emit<K extends EventType>(event: K, data: Ev[K]) {
    this.ev.emit(event, data);
  }

  removeAllListeners() {
    this.ev.all.clear();
  }
}
