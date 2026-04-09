import {distributeAllShips, garrisonAllShips} from "@/services/typedapi/star";
import {formatError, isOk} from "@/services/typedapi";
import { type Axios } from 'axios';

import { type ToastPluginApi } from "vue-toast-notification"
import type {Star} from "@/types/game";
import {useConfirm} from "@/hooks/confirm.ts";
import type {UserGameSettings} from "@solaris/common";
import type { GameStore } from '@/stores/game';

export const makeShipTransferActions = (store: GameStore, httpClient: Axios, toast: ToastPluginApi) => {
  const confirm = useConfirm();
  const settings: UserGameSettings = store.settings!;
  const needsConfirm = settings.star.confirmShipDistribution === 'enabled';

  const transferAllToStar = async (star: Star) => {
    if (needsConfirm && !(await confirm('Transfer all ships to star?', `Are you sure you want to transfer ships from all carriers to ${star.name}?`))) {
      return;
    }

    const response = await garrisonAllShips(httpClient)(store.game!._id, star._id);

    if (isOk(response)) {
      toast.success(`All ships transferred to ${star.name}.`);

      store.gameStarAllShipsTransferred(response.data);
    } else {
      console.error(formatError(response));
    }
  };

  const distributeShips =  async (star: Star) => {
    if (needsConfirm && !(await confirm('Distribute all ships to cariers?', `Are you sure you want to distribute ships to all carriers?`))) {
      return;
    }

    const response = await distributeAllShips(httpClient)(store.game!._id, star._id);

    if (isOk(response)) {
      toast.success(`All ships at ${star.name} distributed to carriers in orbit.`);

      store.gameStarAllShipsTransferred(response.data);
    }
  };

  return {
    transferAllToStar,
    distributeShips,
  };
};


