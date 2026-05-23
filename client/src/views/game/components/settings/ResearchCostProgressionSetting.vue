<template>
  <game-setting-value :title="name + ' Research Cost Progression'"
                      :tooltip="'Determines the growth of research points needed for the next level of ' + name"
                      :valueText="getFriendlyText(progression.progression)"
                      :value="progression.progression" />
  <game-setting-value
    v-if="progression.progression === 'exponential'"
    title="Exponential growth factor" :tooltip="'Determines the speed of exponential growth for ' + name"
    :valueText="getFriendlyText(progression.growthFactor)"
    :value="progression.growthFactor" />
  <game-setting-value
    v-if="progression.progression === 'cumulative'"
    title="Cumulative scaling factor" :tooltip="'Determines the scaling factor applied cumulatively per level for ' + name"
    :valueText="getFriendlyText(String(progression.scalingFactor))"
    :value="String(progression.scalingFactor)" />
</template>
<script setup lang="ts">
import GameSettingValue from "@/views/game/components/settings/GameSettingValue.vue";
import type {GameResearchProgression} from "@solaris/common";

const props = defineProps<{
  progression: GameResearchProgression,
  name: string,
}>();

const getFriendlyText = (value: string) => {
  switch (value) {
    case 'standard':
      return 'Standard';
    case 'exponential':
      return 'Exponential';
    case 'cumulative':
      return 'Cumulative';
    case 'soft':
      return 'Soft (1.25)';
    case 'medium':
      return 'Medium (1.5)';
    case 'hard':
      return 'Hard (1.75)';
    case '0.25':
      return 'x0.25 per level';
    case '0.5':
      return 'x0.5 per level';
    case '0.75':
      return 'x0.75 per level';
    case '1':
      return 'x1 per level';
    default:
      return value;
  }
}
</script>
<style scoped>

</style>
