import mitt from 'mitt'

// TODO: Handle stuff without an event bus or find a better typed solution at least

const emitter = mitt();

const eventBus = {
  $on: emitter.on,
  $off: emitter.off,
  $emit: emitter.emit
};

export default eventBus;
