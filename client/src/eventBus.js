import mitt from 'mitt'

// TODO: Handle stuff without an event bus or find a better typed solution at least

const emitter = mitt();

const eventBus = {
  $on: (...args) => emitter.on(...args),
  $off: (...args) => emitter.off(...args),
  $emit: (...args) => emitter.emit(...args)
};

export default eventBus;
