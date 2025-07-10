<template>
  <div class="menu-page  pb-2">
    <div class="container">
      <menu-title title="Statistics" @onCloseRequested="onCloseRequested"></menu-title>

      <loading-spinner :loading="!statistics"/>

      <div v-if="statistics === 'not-available'" class="alert alert-info">
        <p class="mb-0">Statistics are not available for this game.</p>
      </div>

      <div v-if="statistics && statistics !== 'not-available'">
        <div class="row table-responsive">
          <h5 class="mb-4">Combat</h5>

          <table class="table table-striped table-hover">
            <tbody>
            <tr>
              <td>Ship Kills</td>
              <td class="text-end">{{ statistics.combat.kills.ships }}</td>
            </tr>
            <tr>
              <td>Ship Losses</td>
              <td class="text-end">{{ statistics.combat.losses.ships }}</td>
            </tr>
            <tr>
              <td>Carrier Kills</td>
              <td class="text-end">{{ statistics.combat.kills.carriers }}</td>
            </tr>
            <tr>
              <td>Carrier Losses</td>
              <td class="text-end">{{ statistics.combat.losses.carriers }}</td>
            </tr>
            <tr>
              <td>Specialist Kills</td>
              <td class="text-end">{{ statistics.combat.kills.specialists }}</td>
            </tr>
            <tr>
              <td>Specialist Losses</td>
              <td class="text-end">{{ statistics.combat.losses.specialists }}</td>
            </tr>
            <tr>
              <td>Stars Captured</td>
              <td class="text-end">{{ statistics.combat.stars.captured }}</td>
            </tr>
            <tr>
              <td>Stars Lost</td>
              <td class="text-end">{{ statistics.combat.stars.lost }}</td>
            </tr>
            <tr>
              <td>Capital Stars Captured</td>
              <td class="text-end">{{ statistics.combat.homeStars.captured }}</td>
            </tr>
            <tr>
              <td>Capital Stars Lost</td>
              <td class="text-end">{{ statistics.combat.homeStars.lost }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="row table-responsive">
          <h5 class="mb-4">Infrastructure</h5>

          <table class="table table-striped table-hover">
            <tbody>
              <tr>
                <td>Economy</td>
                <td class="text-end">{{ statistics.infrastructure.economy }}</td>
              </tr>
              <tr>
                <td>Industry</td>
                <td class="text-end">{{ statistics.infrastructure.industry }}</td>
              </tr>
              <tr>
                <td>Science</td>
                <td class="text-end">{{ statistics.infrastructure.science }}</td>
              </tr>
              <tr>
                <td>Warp Gates Built</td>
                <td class="text-end">{{ statistics.infrastructure.warpGates }}</td>
              </tr>
              <tr>
                <td>Warp Gates Destroyed</td>
                <td class="text-end">{{ statistics.infrastructure.warpGatesDestroyed }}</td>
              </tr>
              <tr>
                <td>Specialists Hired</td>
                <td class="text-end">{{ statistics.infrastructure.specialistsHired }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row table-responsive">
          <h5 class="mb-4">Research</h5>

          <table class="table table-striped table-hover">
            <tbody>
              <tr>
                <td>Scanning</td>
                <td class="text-end">{{ statistics.research.scanning }}</td>
              </tr>
              <tr>
                <td>Hyperspace</td>
                <td class="text-end">{{ statistics.research.hyperspace }}</td>
              </tr>
              <tr>
                <td>Terraforming</td>
                <td class="text-end">{{ statistics.research.terraforming }}</td>
              </tr>
              <tr>
                <td>Weapons</td>
                <td class="text-end">{{ statistics.research.weapons }}</td>
              </tr>
              <tr>
                <td>Banking</td>
                <td class="text-end">{{ statistics.research.banking }}</td>
              </tr>
              <tr>
                <td>Manufacturing</td>
                <td class="text-end">{{ statistics.research.manufacturing }}</td>
              </tr>
              <tr>
                <td>Experimentation</td>
                <td class="text-end">{{ statistics.research.experimentation }}</td>
              </tr>
              <tr>
                <td>Specialists</td>
                <td class="text-end">{{ statistics.research.specialists }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row table-responsive">
          <h5 class="mb-4">Trade</h5>

          <table class="table table-striped table-hover">
            <tbody>
              <tr>
                <td>Credits Sent</td>
                <td class="text-end">{{ statistics.trade.creditsSent }}</td>
              </tr>
              <tr>
                <td>Credits Received</td>
                <td class="text-end">{{ statistics.trade.creditsReceived }}</td>
              </tr>
              <tr>
                <td>Specialist Tokens Sent</td>
                <td class="text-end">{{ statistics.trade.creditsSpecialistsSent }}</td>
              </tr>
              <tr>
                <td>Specialist Tokens Received</td>
                <td class="text-end">{{ statistics.trade.creditsSpecialistsReceived }}</td>
              </tr>
              <tr>
                <td>Technology Sent</td>
                <td class="text-end">{{ statistics.trade.technologySent }}</td>
              </tr>
              <tr>
                <td>Technology Received</td>
                <td class="text-end">{{ statistics.trade.technologyReceived }}</td>
              </tr>
              <tr>
                <td>Gifts Sent</td>
                <td class="text-end">{{ statistics.trade.giftsSent }}</td>
              </tr>
              <tr>
                <td>Gifts Received</td>
                <td class="text-end">{{ statistics.trade.giftsReceived }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted, type Ref } from 'vue';
import {formatError, httpInjectionKey, isOk, ResponseResultKind} from "@/services/typedapi";
import type {Statistics} from "@solaris-common";
import LoadingSpinner from "@/views/components/LoadingSpinner.vue";
import MenuTitle from "@/views/game/components/MenuTitle.vue";
import {getGameStatistics} from "@/services/typedapi/game";
import { useStore, type Store } from 'vuex';
import type { State } from "@/store";
import GameHelper from "@/services/gameHelper";

const httpClient = inject(httpInjectionKey)!;

const store: Store<State> = useStore();

const emit = defineEmits<{
  onCloseRequested: [];
}>();

const statistics: Ref<Statistics | 'not-available' | null> = ref(null);

const userPlayer = computed(() => GameHelper.getUserPlayer(store.state.game));

const onCloseRequested = () => {
  emit('onCloseRequested');
};

onMounted(async () => {
  if (!userPlayer) {
    return;
  }

  const response = await getGameStatistics(httpClient)(store.state.game._id, userPlayer.value!._id);

  if (isOk(response)) {
    statistics.value = response.data;
  } else {
    if (response.kind === ResponseResultKind.ResponseError) {
      if (response.status === 404) {
        statistics.value = 'not-available';
        return;
      }
    }

    console.error(formatError(response));
  }
});

</script>

<style scoped>

</style>
