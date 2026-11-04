import { useGameStore } from "@/stores/game";
import router from "@/router";
import AudioService from "@/services/audio";
import { ref, computed, inject } from "vue";
import { isOk } from "@solaris/api-client";
import { httpInjectionKey } from "@/services/http";
import type { Game } from "@/types/game";
import { concedeDefeat } from "@solaris/api-client/game";

import { useToast } from "vue-toast-notification";

export const useConcedeGame = () => {
  const httpClient = inject(httpInjectionKey)!;
  const toast = useToast();

  const store = useGameStore();
  const game = computed<Game>(() => store.game!);

  const isConceding = ref(false);

  const concede = async (openSlot: boolean, isTutorialGame: boolean) => {
    isConceding.value = true;

    try {
      const response = await concedeDefeat(httpClient)(
        game.value._id,
        openSlot,
      );

      if (isOk(response)) {
        AudioService.quit();

        if (!isTutorialGame) {
          toast.error(`You have conceded defeat, better luck next time.`);
        }

        await router.push({ name: "main-menu" });
      }
    } catch (err) {
      console.error(err);
    }

    isConceding.value = false;
  };

  return {
    isConceding,
    concede,
  };
};
