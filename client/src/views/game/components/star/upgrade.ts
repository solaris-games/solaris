import type {InfrastructureType, InfrastructureUpgradeReport} from "@solaris-common";
import {formatError, isOk, type ResponseResult} from "@/services/typedapi";
import AudioService from "@/game/audio";
import type {State} from "@/store";
import { type Store } from 'vuex';
import { type ToastPluginApi } from "vue-toast-notification"
import {makeConfirm} from "@/util/confirm";
import type {Star} from "@/types/game";
import { type Ref } from 'vue';
import {buildWarpGate as buildWarpGateReq, destroyWarpGate as destroyWarpGateReq} from "@/services/typedapi/star";
import { type Axios } from 'axios';

export const makeUpgrade = (store: Store<State>, toast: ToastPluginApi, star: Star) => (infrastructure: InfrastructureType, needsConfirm: boolean, isLoading: Ref<boolean>, commitName: string, req: (gameId: string, starId: string) => Promise<ResponseResult<InfrastructureUpgradeReport<string>>>) => async () => {
  const confirm = makeConfirm(store);

  if (needsConfirm && !await confirm(`Upgrade ${infrastructure}`, `Are you sure you want to upgrade ${infrastructure} at ${star.name} for $${star.upgradeCosts![infrastructure]} credits?`)) {
    return;
  }

  isLoading.value = true;

  const response = await req(store.state.game._id, star._id);

  if (isOk(response)) {
    toast.default(`Upgraded ${infrastructure} at ${star.name}`);

    store.commit(commitName, response.data);

    AudioService.hover();
  } else {
    toast.error(`Upgrading ${infrastructure} failed`);
  }

  isLoading.value = false;
};

export const makeWarpgateActions = (store: Store<State>, toast: ToastPluginApi, httpClient: Axios, star: Star) => {
  const confirm = makeConfirm(store);

  const buildWarpGate =  async () => {
    if (store.state.settings.star.confirmBuildWarpGate === 'enabled' && !await confirm('Build Warp Gate', `Are you sure you want build a Warp Gate at ${star.name}? The upgrade will cost $${star.upgradeCosts!.warpGate}.`)) {
      return;
    }

    const response = await buildWarpGateReq(httpClient)(store.state.game._id, star._id);

    if (isOk(response)) {
      toast.default(`Warp Gate built at ${star.name}.`)

      store.commit('gameStarWarpGateBuilt', response.data);

      AudioService.join();
    } else {
      console.error(formatError(response));
      toast.error("Error building warp gate");
    }
  };

  const destroyWarpGate = async () => {
    if (store.state.settings.star.confirmDestroyWarpGate === 'enabled' && !await confirm('Destroy Warp Gate', `Are you sure you want destroy a Warp Gate at ${star.name}? The upgrade will cost $${star.upgradeCosts!.warpGate}.`)) {
      return;
    }

    const response = await destroyWarpGateReq(httpClient)(store.state.game._id, star._id);

    if (isOk(response)) {
      toast.default(`Warp Gate destroyed at ${star.name}.`)

      store.commit('gameStarWarpGateDestroyed', {
        starId: star._id,
      });

      AudioService.join();
    } else {
      console.error(formatError(response));
      toast.error("Error destroying warp gate");
    }
  };

  return {
    buildWarpGate,
    destroyWarpGate,
  };
};
