export const attachEventDeduplication = (topLevel, targetView) => {
  let lastEvent = null;

  topLevel.addEventListener('pointerup', (e) => {
    if (e.target === targetView) {
      lastEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        timeStamp: e.timeStamp
      };
    }
  }, true);

  topLevel.addEventListener('click', (e) => {
    if (lastEvent && e.timeStamp <= lastEvent.timeStamp + 100) {
      e.stopPropagation();
    }

    lastEvent = null;
  }, true);
};
