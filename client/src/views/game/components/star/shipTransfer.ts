import {distributeAllShips, garrisonAllShips} from "@/services/typedapi/star";
import {formatError, isOk} from "@/services/typedapi";
import { type Axios } from 'axios';
import type {State} from "@/store";
import { type Store } from 'vuex';
import { type ToastPluginApi } from "vue-toast-notification"
import type {Star} from "@/types/game";

export const makeShipTransferActions = (store: Store<State>, httpClient: Axios, toast: ToastPluginApi) => {
  const transferAllToStar = async (star: Star) => {
    const response = await garrisonAllShips(httpClient)(store.state.game._id, star._id);

    if (isOk(response)) {
      toast.default(`All ships transferred to ${star.name}.`);

      store.commit('gameStarAllShipsTransferred', response.data);
    } else {
      console.error(formatError(response));
    }
  };

  const distributeShips =  async (star: Star) => {
    const response = await distributeAllShips(httpClient)(store.state.game._id, star._id);

    if (isOk(response)) {
      toast.default(`All ships at ${star.name} distributed to carriers in orbit.`);

      store.commit('gameStarAllShipsTransferred', response.data);
    }
  };

  return {
    transferAllToStar,
    distributeShips,
  };
};



