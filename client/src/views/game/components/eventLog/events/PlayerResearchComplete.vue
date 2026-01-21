<template>
<div>
  <p>
      Your scientists have made a breakthrough in the field of <span class="text-warning">{{getTechnologyFriendlyName(event.data.technologyKey)}} Level {{event.data.technologyLevel}}</span>.
  </p>
  <p>
      Your scientists are now researching <span class="text-info">{{getTechnologyFriendlyName(event.data.technologyKeyNext)}} Level {{event.data.technologyLevelNext}}</span>.
  </p>
</div>
</template>

<script setup lang="ts">
import TechnologyHelper from '../../../../../services/technologyHelper'
import type {PlayerResearchCompleteEvent, ResearchType} from "@solaris-common";

const props = defineProps<{
  event: PlayerResearchCompleteEvent<string>,
}>();

const getTechnologyFriendlyName = (key: string) => TechnologyHelper.getFriendlyName(key as ResearchType);
</script>

<style scoped>
</style>
