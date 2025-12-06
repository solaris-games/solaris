<template>
    <div class="row bg-dark pt-2 pb-0 mb-1" v-if="carrier">
        <div class="col">
          <h5 v-if="!carrier.specialist" class="pt-1 text-danger">None Assigned</h5>
          <h5 v-if="carrier.specialist" class="pt-1 text-warning">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            {{carrier.specialist.name}}
          </h5>
        </div>
        <div v-if="!isHistoricalMode && canHireSpecialist && !isGameFinished" class="col-auto">
            <button class="btn btn-sm btn-success" @click="onViewHireCarrierSpecialistRequested"><i class="fas fa-user-astronaut"></i> Hire Specialist</button>
        </div>
        <div class="col-12 mt-2">
            <p v-if="carrier.specialist">{{carrier.specialist.description}}</p>
            <p v-if="carrier.specialist && carrier.specialist.oneShot" class="text-warning"><small>This specialist cannot be replaced.</small></p>
            <p v-if="carrier.specialist && carrier.specialistExpireTick" class="text-warning"><small>This specialist expires on tick {{carrier.specialistExpireTick}}.</small></p>
            <p class="mb-2" v-if="!carrier.specialistId">
              <small><i>This carrier does not have a specialist assigned.</i></small>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import type {Carrier, Game} from "@/types/game";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const props = defineProps<{
  carrierId: string,
}>();

const emit = defineEmits<{
  onViewHireCarrierSpecialistRequested: [carrierId: string];
}>();

const store = useStore();
const isHistoricalMode = useIsHistoricalMode(store);
const game = computed<Game>(() => store.state.game);
const isGameFinished = computed(() => GameHelper.isGameFinished(game.value));

const carrier = ref<Carrier | null>(null);
const canHireSpecialist = ref(false);

const onViewHireCarrierSpecialistRequested = () => emit('onViewHireCarrierSpecialistRequested', props.carrierId);

onMounted(() => {
  carrier.value = GameHelper.getCarrierById(game.value, props.carrierId)!;

  if (carrier.value.orbiting) {
    const userPlayer = GameHelper.getUserPlayer(game.value);
    const star = GameHelper.getCarrierOrbitingStar(game.value, carrier.value)!;
    const isDeadStar = GameHelper.isDeadStar(star);

    canHireSpecialist.value = Boolean(userPlayer
      && game.value.settings.specialGalaxy.specialistCost !== 'none'  // Specs are enabled
      && userPlayer._id === carrier.value.ownedByPlayerId                     // User owns the carrier
      && star.ownedByPlayerId === carrier.value.ownedByPlayerId               // User owns the star
      && !isDeadStar                                                         // Star isn't dead
      && (!carrier.value.specialistId || !carrier.value?.specialist?.oneShot));       // Carrier doesn't already have a spec on it
  }
});
</script>

<style scoped>
</style>
