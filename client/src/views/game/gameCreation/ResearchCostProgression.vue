<template>
  <div class="mb-2">
    <label :for="'researchProgression' + name" class="col-form-label">{{name}} Research Cost Progression <help-tooltip tooltip="Determines the growth of research points needed for the next level of technology"/></label>
    <select class="form-control" id="'researchProgression' + name" v-model="researchProgression.progression" :disabled="isCreatingGame">
      <option v-for="opt in options.technology.researchCostProgression" v-bind:key="opt.value" v-bind:value="opt.value">
        {{ opt.text }}
      </option>
    </select>
  </div>

  <div class="mb-2" v-if="researchProgression && researchProgression.progression === 'exponential'">
    <label :for="'researchProgressionFactor' + name" class="col-form-label">{{name}} Exponential growth factor <help-tooltip tooltip="Determines the speed of exponential growth"/></label>
    <select class="form-control" :id="'researchProgressionFactor' + name" v-model="researchProgression.growthFactor" :disabled="isCreatingGame">
      <option v-for="opt in options.technology.researchCostProgressionGrowthFactor" v-bind:key="opt.value" v-bind:value="opt.value">
        {{ opt.text }}
      </option>
    </select>
  </div>

</template>
<script setup lang="ts">
import {GAME_CREATION_OPTIONS, type GameResearchProgression} from "@solaris-common";
import HelpTooltip from "@/views/components/HelpTooltip.vue";

const options = GAME_CREATION_OPTIONS;

const props = defineProps<{
  isCreatingGame: boolean,
  name: string,
}>();

const researchProgression = defineModel<GameResearchProgression>({ default: { progression: 'standard' }, required: true });
</script>
<style scoped>

</style>
