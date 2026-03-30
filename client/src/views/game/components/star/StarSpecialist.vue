<template>
    <div class="row bg-dark pt-2 pb-0 mb-1" v-if="star">
        <div class="col">
          <h5 v-if="!star.specialist" class="pt-1 text-danger">None Assigned</h5>
          <h5 v-if="star.specialist" class="pt-1 text-warning">
            <specialist-icon :type="'star'" :defaultIcon="'user-astronaut'" :specialist="star.specialist"></specialist-icon>
            {{star.specialist.name}}
          </h5>
        </div>
        <div v-if="!isHistoricalMode && canHireSpecialist && !isGameFinished" class="col-auto">
          <button class="btn btn-sm btn-success" @click="onViewHireStarSpecialistRequested"><i class="fas fa-user-astronaut"></i> Hire Specialist</button>
        </div>
        <div class="col-12 mt-2">
            <p v-if="star.specialist">{{star.specialist.description}}</p>
            <p v-if="star.specialist && star.specialist.oneShot" class="text-warning"><small>This specialist cannot be replaced.</small></p>
            <p v-if="star.specialist && star.specialistExpireTick" class="text-warning"><small>This specialist expires on tick {{star.specialistExpireTick}}.</small></p>
            <p class="mb-2" v-if="!star.specialistId">
              <small><i>This star does not have a specialist assigned.</i></small>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import type {Game} from "@/types/game";
import {useIsHistoricalMode} from "@/util/reactiveHooks.ts";

const props = defineProps<{
  starId: string,
}>();

const emit = defineEmits<{
  onViewHireStarSpecialistRequested: [starId: string],
}>();

const onViewHireStarSpecialistRequested = () => emit('onViewHireStarSpecialistRequested', props.starId);

const store = useStore();
const game = computed<Game>(() => store.game);
const isHistoricalMode = useIsHistoricalMode(store);
const star = computed(() => GameHelper.getStarById(game.value, props.starId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const isGameFinished = computed(() => GameHelper.isGameFinished(game.value));
const canHireSpecialist = computed(() => userPlayer.value &&
  game.value.settings.specialGalaxy.specialistCost !== 'none' &&
  userPlayer.value._id === star.value.ownedByPlayerId &&
  (!star.value.specialistId || !star.value.specialist!.oneShot)
);
</script>

<style scoped>
</style>
