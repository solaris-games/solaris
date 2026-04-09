import type {InfrastructureType, InfrastructureUpgradeReport} from "@solaris/common";
import {formatError, isOk, type ResponseResult} from "@/services/typedapi";
import AudioService from "@/game/audio";

import { type ToastPluginApi } from "vue-toast-notification"
import {useConfirm} from "@/hooks/confirm.ts";
import type {Star} from "@/types/game";
import { type Ref } from 'vue';
import {buildWarpGate as buildWarpGateReq, destroyWarpGate as destroyWarpGateReq} from "@/services/typedapi/star";
import { type Axios } from 'axios';
import type { GameStore } from '@/stores/game';
import type { EventBus } from '@/eventBus';

export const makeUpgrade = (store: GameStore, eventBus: EventBus, toast: ToastPluginApi, star: Star) => (infrastructure: InfrastructureType, needsConfirm: boolean, isLoading: Ref<boolean>, action: (eventBus: EventBus, data: InfrastructureUpgradeReport<string>) => void, req: (gameId: string, starId: string) => Promise<ResponseResult<InfrastructureUpgradeReport<string>>>) => async () => {
  const confirm = useConfirm();

  if (needsConfirm && !await confirm(`Upgrade ${infrastructure}`, `Are you sure you want to upgrade ${infrastructure} at ${star.name} for $${star.upgradeCosts![infrastructure]} credits?`)) {
    return;
  }

  isLoading.value = true;

  const response = await req(store.game!._id, star._id);

  if (isOk(response)) {
    toast.default(`Upgraded ${infrastructure} at ${star.name}`);

    action(eventBus, response.data);

    AudioService.hover();
  } else {
    toast.error(`Upgrading ${infrastructure} failed`);
  }

  isLoading.value = false;
};

export const makeWarpgateActions = (store: GameStore, eventBus: EventBus, toast: ToastPluginApi, httpClient: Axios, star: Star) => {
  const confirm = useConfirm();

  const buildWarpGate = async () => {
    if (store.settings!.star.confirmBuildWarpGate === 'enabled' && !await confirm('Build Warp Gate', `Are you sure you want build a Warp Gate at ${star.name}? The upgrade will cost $${star.upgradeCosts!.warpGate}.`)) {
      return;
    }

    const response = await buildWarpGateReq(httpClient)(store.game!._id, star._id);

    if (isOk(response)) {
      toast.default(`Warp Gate built at ${star.name}.`)

      store.gameStarWarpGateBuilt(eventBus, response.data);

      AudioService.join();
    } else {
      console.error(formatError(response));
      toast.error("Error building warp gate");
    }
  };

  const destroyWarpGate = async () => {
    if (store.settings!.star.confirmBuildWarpGate === 'enabled' && !await confirm('Destroy Warp Gate', `Are you sure you want destroy a Warp Gate at ${star.name}? The upgrade will cost $${star.upgradeCosts!.warpGate}.`)) {
      return;
    }

    const response = await destroyWarpGateReq(httpClient)(store.game!._id, star._id);

    if (isOk(response)) {
      toast.default(`Warp Gate destroyed at ${star.name}.`)

      store.gameStarWarpGateDestroyed(eventBus, { starId: star._id });

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
