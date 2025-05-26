import type { Location } from '@solaris-common';
import { Graphics } from 'pixi.js';

const STAR_HIGHLIGHT_RADIUS = 12;

export const createStarHighlight = (location: Location, alpha = 1) => {
  const graphics = new Graphics();
  const radius = STAR_HIGHLIGHT_RADIUS;

  graphics.star(location.x, location.y, radius, radius, radius - 3);
  graphics.stroke({
    width: 1,
    color: 0xFFFFFF,
    alpha,
  });

  return graphics;
}
