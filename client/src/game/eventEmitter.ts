import mitt, { type Emitter, type Handler } from 'mitt';

export class EventEmitter<EventType extends string, Ev extends Record<EventType, unknown>> {
  ev: Emitter<Ev>;

  constructor() {
    this.ev = mitt();
  }

  on(event: EventType, handler: Handler<Ev[EventType]>) {
    this.ev.on(event, handler);
  }

  off(event: EventType, handler: Handler<Ev[EventType]>) {
    this.ev.off(event, handler);
  }

  emit(event: EventType, data: Ev[EventType]) {
    this.ev.emit(event, data);
  }

  removeAllListeners() {
    this.ev.all.clear();
  }
}
