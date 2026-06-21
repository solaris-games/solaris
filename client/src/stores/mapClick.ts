import { defineStore } from "pinia";
import type {Carrier, Star} from "@/types/game.ts";
import { ref } from "vue";
import type {StarClickDispatchArgs} from "@solaris/map-rendering";

export type StarClickCallback = (star: Star) => void;
export type CarrierClickCallback = (carrier: Carrier) => void;

export const useMapClickStore = defineStore('mapClick', () => {
  const starClickCallback = ref<StarClickCallback | null>(null);
  const starRightClickCallback = ref<StarClickCallback | null>(null);
  const carrierClickCallback = ref<CarrierClickCallback | null>(null);

  const onStarClick = (args: StarClickDispatchArgs) => {

  };

  const onStarRightClick = (args: StarClickDispatchArgs) => {

  };

  const onCarrierClick = () => {

  };

  const onCarrierRightClick = () => {

  };

  const setStarClickCallback = (cb: StarClickCallback | null) => {

  };

  const setStarRightClickCallback = (cb: StarClickCallback | null) => {

  };

  const setCarrierClickCallback = (cb: CarrierClickCallback | null) => {

  };

  const setCarrierRightClickCallback = (cb: CarrierClickCallback | null) => {

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
