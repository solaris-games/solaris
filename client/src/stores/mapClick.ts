import { defineStore } from "pinia";
import type { Carrier, Player, Star } from "@/types/game.ts";
import { ref } from "vue";
import type { StarClickDispatchArgs } from "@solaris/map-rendering";
import type { CarrierClickDispatchArgs } from "@solaris/map-rendering";

export type StarClickCallback = (
  star: Star,
  owningPlayer: Player | undefined,
) => void;
export type CarrierClickCallback = (
  carrier: Carrier,
  owningPlayer: Player | undefined,
) => void;

export const useMapClickStore = defineStore("mapClick", () => {
  const starClickCallback = ref<StarClickCallback | null>(null);
  const starRightClickCallback = ref<StarClickCallback | null>(null);
  const carrierClickCallback = ref<CarrierClickCallback | null>(null);
  const carrierRightClickCallback = ref<CarrierClickCallback | null>(null);

  const onStarClick = (args: StarClickDispatchArgs) => {
    if (starClickCallback.value) {
      starClickCallback.value(args.star, args.owningPlayer);
    } else {
      args.defaultCallback();
    }
  };

  const onStarRightClick = (args: StarClickDispatchArgs) => {
    if (starRightClickCallback.value) {
      starRightClickCallback.value(args.star, args.owningPlayer);
    } else {
      args.defaultCallback();
    }
  };

  const onCarrierClick = (args: CarrierClickDispatchArgs) => {
    if (carrierClickCallback.value) {
      carrierClickCallback.value(args.carrier, args.owningPlayer);
    } else {
      args.defaultCallback();
    }
  };

  const onCarrierRightClick = (args: CarrierClickDispatchArgs) => {
    if (carrierRightClickCallback.value) {
      carrierRightClickCallback.value(args.carrier, args.owningPlayer);
    } else {
      args.defaultCallback();
    }
  };

  const setStarClickCallback = (cb: StarClickCallback | null) => {
    starClickCallback.value = cb;
  };

  const setStarRightClickCallback = (cb: StarClickCallback | null) => {
    starRightClickCallback.value = cb;
  };

  const setCarrierClickCallback = (cb: CarrierClickCallback | null) => {
    carrierClickCallback.value = cb;
  };

  const setCarrierRightClickCallback = (cb: CarrierClickCallback | null) => {
    carrierRightClickCallback.value = cb;
  };

  return {
    onStarClick,
    onStarRightClick,
    onCarrierClick,
    onCarrierRightClick,
    setStarClickCallback,
    setStarRightClickCallback,
    setCarrierClickCallback,
    setCarrierRightClickCallback,
  };
});
