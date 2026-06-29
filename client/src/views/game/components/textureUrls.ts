import type { TextureUrls } from "@solaris/map-rendering";

const SPECIALIST_NAMES = [
  "mecha-head",
  "mecha-mask",
  "android-mask",
  "hazmat-suit",
  "cyborg-face",
  "lunar-module",
  "spaceship",
  "power-generator",
  "energise",
  "sattelite",
  "airtight-hatch",
  "cannister",
  "defense-satellite",
  "habitat-dome",
  "techno-heart",
  "missile-pod",
  "space-suit",
  "strafe",
  "ringed-planet",
  "observatory",
  "alien-stare",
  "afterburn",
  "pirate",
  "spoutnik",
  "starfighter",
  "double-ringed-orb",
  "rocket",
  "ray-gun",
  "radar-dish",
  "energy-tank",
  "cryo-chamber",
  "vintage-robot",
  "targeting",
  "rocket-thruster",
  "megabot",
  "forward-field",
  "star-gate",
  "bolter-gun",
];

export const mapTextureUrls: TextureUrls = {
  CARRIER: new URL(
    "../../../assets/map-objects/128x128_carrier.svg",
    import.meta.url,
  ).href,
  STAR: new URL("../../../assets/stars/star.png", import.meta.url).href,
  STARLESS_NEBULA_1: new URL(
    "../../../assets/nebula/neb0-starless.webp",
    import.meta.url,
  ).href,
  STARLESS_NEBULA_2: new URL(
    "../../../assets/nebula/neb1-starless.webp",
    import.meta.url,
  ).href,
  STAR_NEBULA_1: new URL(
    "../../../assets/nebula/star-nebula-0.webp",
    import.meta.url,
  ).href,
  STAR_NEBULA_2: new URL(
    "../../../assets/nebula/star-nebula-1.webp",
    import.meta.url,
  ).href,
  STAR_NEBULA_3: new URL(
    "../../../assets/nebula/star-nebula-2.webp",
    import.meta.url,
  ).href,
  STAR_ASTEROID_FIELD_1: new URL(
    "../../../assets/stars/star-asteroid-field-0.png",
    import.meta.url,
  ).href,
  STAR_ASTEROID_FIELD_2: new URL(
    "../../../assets/stars/star-asteroid-field-1.png",
    import.meta.url,
  ).href,
  STAR_ASTEROID_FIELD_3: new URL(
    "../../../assets/stars/star-asteroid-field-2.png",
    import.meta.url,
  ).href,
  STAR_WORMHOLE: new URL("../../../assets/stars/vortex.png", import.meta.url)
    .href,
  CIRCLES: [
    new URL("../../../assets/map-objects/256x256_circle.svg", import.meta.url)
      .href,
    new URL(
      "../../../assets/map-objects/256x256_circle_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_circle_partial.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_circle_partial_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/128x128_circle_carrier.svg",
      import.meta.url,
    ).href,
  ],
  HEXAGONS: [
    new URL("../../../assets/map-objects/256x256_hexagon.svg", import.meta.url)
      .href,
    new URL(
      "../../../assets/map-objects/256x256_hexagon_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_hexagon_partial.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_hexagon_partial_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/128x128_hexagon_carrier.svg",
      import.meta.url,
    ).href,
  ],
  DIAMONDS: [
    new URL("../../../assets/map-objects/256x256_diamond.svg", import.meta.url)
      .href,
    new URL(
      "../../../assets/map-objects/256x256_diamond_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_diamond_partial.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_diamond_partial_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/128x128_diamond_carrier.svg",
      import.meta.url,
    ).href,
  ],
  SQUARES: [
    new URL("../../../assets/map-objects/256x256_square.svg", import.meta.url)
      .href,
    new URL(
      "../../../assets/map-objects/256x256_square_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_square_partial.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/256x256_square_partial_warp_gate.svg",
      import.meta.url,
    ).href,
    new URL(
      "../../../assets/map-objects/128x128_square_carrier.svg",
      import.meta.url,
    ).href,
  ],
  STAR_SCANNABLE: new URL(
    "../../../assets/map-objects/128x128_star_scannable.svg",
    import.meta.url,
  ).href,
  STAR_UNSCANNABLE: new URL(
    "../../../assets/map-objects/128x128_star_unscannable.svg",
    import.meta.url,
  ).href,
  HOME: new URL(
    "../../../assets/map-objects/128x128_star_home.svg",
    import.meta.url,
  ).href,
  BLACK_HOLE: new URL(
    "../../../assets/map-objects/128x128_star_black_hole.svg",
    import.meta.url,
  ).href,
  BLACK_HOLE_BINARY: new URL(
    "../../../assets/map-objects/128x128_star_black_hole_binary.svg",
    import.meta.url,
  ).href,
  BINARY_SCANNABLE: new URL(
    "../../../assets/map-objects/128x128_star_scannable_binary.svg",
    import.meta.url,
  ).href,
  BINARY_UNSCANNABLE: new URL(
    "../../../assets/map-objects/128x128_star_unscannable_binary.svg",
    import.meta.url,
  ).href,
  SPECIALISTS: Object.fromEntries(
    SPECIALIST_NAMES.map((name) => [
      name,
      new URL(`../../../assets/specialists/${name}.svg`, import.meta.url).href,
    ]),
  ),
};
