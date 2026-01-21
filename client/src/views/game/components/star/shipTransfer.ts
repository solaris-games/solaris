import {distributeAllShips, garrisonAllShips} from "@/services/typedapi/star";
import {formatError, isOk} from "@/services/typedapi";
import { type Axios } from 'axios';
import type {State} from "@/store";
import { type Store } from 'vuex';
import { type ToastPluginApi } from "vue-toast-notification"
import type {Star} from "@/types/game";
import {makeConfirm} from "@/util/confirm";
import type {UserGameSettings} from "@solaris-common";

export const makeShipTransferActions = (store: Store<State>, httpClient: Axios, toast: ToastPluginApi) => {
  const confirm = makeConfirm(store);
  const settings: UserGameSettings = store.state.settings;
  const needsConfirm = settings.star.confirmShipDistribution === 'enabled';

  const transferAllToStar = async (star: Star) => {
    if (needsConfirm && !(await confirm('Transfer all ships to star?', `Are you sure you want to transfer ships from all carriers to ${star.name}?`))) {
      return;
    }

    const response = await garrisonAllShips(httpClient)(store.state.game._id, star._id);

    if (isOk(response)) {
      toast.success(`All ships transferred to ${star.name}.`);

      store.commit('gameStarAllShipsTransferred', response.data);
    } else {
      console.error(formatError(response));
    }
  };

  const distributeShips =  async (star: Star) => {
    if (needsConfirm && !(await confirm('Distribute all ships to cariers?', `Are you sure you want to distribute ships to all carriers?`))) {
      return;
    }

    const response = await distributeAllShips(httpClient)(store.state.game._id, star._id);

    if (isOk(response)) {
      toast.success(`All ships at ${star.name} distributed to carriers in orbit.`);

      store.commit('gameStarAllShipsTransferred', response.data);
    }
  };

  return {
    transferAllToStar,
    distributeShips,
  };
};



