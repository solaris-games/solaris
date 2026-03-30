import { defineStore } from 'pinia';
import type {Player, Star} from "@/types/game";
import { ref } from 'vue';
import type {OnPreStarParams} from "@/eventBusEventNames/map.ts";

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
  const mentionCallbacks = ref<MentionCallbacks | null>(null);

  const setMentions = (data: MentionData) => {
    mentionReceivingElement.value = data.element;
    mentionCallbacks.value = data.callbacks;
  };

  const resetMentions = () => {
    mentionCallbacks.value = null;
    mentionReceivingElement.value = null;
  };

  const playerClicked = (data: PlayerClickedData) => {
    if (mentionCallbacks.value && mentionCallbacks.value.player) {
      mentionCallbacks.value.player(data.player);
    } else {
      data.permitCallback(data.player);
    }
  };

  const starClicked = (data: OnPreStarParams) => {
    if (mentionCallbacks.value && mentionCallbacks.value.star) {
      mentionCallbacks.value.star(data.star);
    } else {
      data.defaultCallback();
    }
  };

  const starRightClicked = (data: OnPreStarParams) => {
    if (mentionCallbacks.value && mentionCallbacks.value.player && data.owningPlayer) {
      mentionCallbacks.value.player(data.owningPlayer);
    } else {
      data.defaultCallback();
    }
  };

  return {
    mentionReceivingElement,
    setMentions,
    resetMentions,
    playerClicked,
    starClicked,
    starRightClicked,
  };
});
