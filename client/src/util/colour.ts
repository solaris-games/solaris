export const colorFromString = (colorString: string): number => {
  const cleaned = colorString.replace(/#|0x/, '').toLowerCase();

  const color = parseInt(cleaned, 16);

  if (isNaN(color) || color < 0 || color > 0xFFFFFF) {
    throw new Error(`Invalid color string: ${cleaned}`);
  }

  return color;
}
