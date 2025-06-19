import type {InfrastructureType, InfrastructureUpgradeReport} from "@solaris-common";
import {isOk, type ResponseResult} from "@/services/typedapi";
import AudioService from "@/game/audio";
import type {State} from "@/store";
import { type Store } from 'vuex';
import { type ToastPluginApi } from "vue-toast-notification"
import {makeConfirm} from "@/util/confirm";
import type {Star} from "@/types/game";
import { type Ref } from 'vue';

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
}
