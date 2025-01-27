import { type Location } from '@solaris-common';

const LIGHTYEARS = 50;

export const formatLocation = (location: Location) => {
  return `(${(location.x/LIGHTYEARS).toFixed(2)}, ${(location.y/LIGHTYEARS).toFixed(2)})`;
}
