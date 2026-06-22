import { defineStore } from 'pinia';
import { type StarClickDispatchArgs } from '@solaris/map-rendering';
import type {Player, Star} from "@/types/game";
import { ref } from 'vue';
import {type StarClickCallback, useMapClickStore} from "@/stores/mapClick.ts";

export type MentionData = {
  element: HTMLTextAreaElement,
  callbacks: MentionCallbacks,
}

export type MentionCallbacks = {
  player: (p: Player) => void;
  star: (s: Star) => void;
}

export type PlayerClickedData = {
  player: Player,
  permitCallback: (p: Player) => void,
}

export const useMentionStore = defineStore('mentions', () => {
  const mentionReceivingElement = ref<HTMLTextAreaElement | null>(null);
  const playerCallback = ref<((p: Player) => void) | null>(null);
  const starCallback = ref<StarClickCallback | null>(null);
  const starRightCallback = ref<StarClickCallback | null>(null);

  const mapClickStore = useMapClickStore();

  const setMentions = (data: MentionData) => {
    mentionReceivingElement.value = data.element;
    playerCallback.value = data.callbacks.player;
    starCallback.value = (sc, _) => data.callbacks.star(sc);
    starRightCallback.value = (_, p) => p && data.callbacks.player(p);
    mapClickStore.setStarClickCallback(starCallback.value);
    mapClickStore.setStarRightClickCallback(starRightCallback.value);
  };

  const resetMentions = () => {
    mapClickStore.setStarClickCallback(null);
    mapClickStore.setStarRightClickCallback(null);
    playerCallback.value = null;
    mentionReceivingElement.value = null;
    starCallback.value = null;
    starRightCallback.value = null;
  };

  const playerClicked = (data: PlayerClickedData) => {
    if (playerCallback.value) {
      playerCallback.value(data.player);
    } else {
      data.permitCallback(data.player);
    }
  };

  return {
    mentionReceivingElement,
    setMentions,
    resetMentions,
    playerClicked,
  };
});
