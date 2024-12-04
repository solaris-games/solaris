import mitt, { type Emitter } from 'mitt';

// longer term, we want to rework rendering code anyways
export class EventEmitter {
  ev: Emitter<any>;

  constructor() {
    this.ev = mitt();
  }

  on(event, handler) {
    this.ev.on(event, handler);
  }

  off(event, handler) {
    this.ev.off(event, handler);
  }

  emit(event, data) {
    this.ev.emit(event, data);
  }

  removeAllListeners() {
    this.ev.all.clear();
  }
}
