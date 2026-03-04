<template>
  <tr>
    <td class="row-icon"><i class="fas" :class="iconClass"></i></td>
    <td>{{title}}</td>
    <td class="text-end" :class="playerStyle">
      Level {{ playerResearchLevel }}
    </td>
    <td
      v-if="userPlayer && player != userPlayer"
      class="text-end"
      :class="userPlayerStyle"
    >
      {{ userPlayerResearchLevel }}
    </td>
  </tr>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import gameHelper from "../../../../services/gameHelper";
import type {Game, Player} from "@/types/game";
import type {ResearchTypeNotRandom} from "@solaris-common";

const props = defineProps<{
  player: Player,
  userPlayer: Player | undefined,
  research: ResearchTypeNotRandom,
  title: string,
  iconClass: string,
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

const playerResearchLevel = computed(() => props.player.research[props.research].level);

const userPlayerResearchLevel = computed(() => props.userPlayer?.research[props.research].level);

const hasHighestTechLevel = computed(() => gameHelper.playerHasHighestTechLevel(
  game.value,
  props.research,
  props.player
));

const hasLowestTechLevel = computed(() => gameHelper.playerHasLowestTechLevel(
  game.value,
  props.research,
  props.player
));

const playerStyle = computed(() => {
  if ((props.userPlayer && props.userPlayer == props.player) || !props.userPlayer) {
    return {
      "text-success": hasHighestTechLevel.value,
      "text-danger": hasLowestTechLevel.value,
    };
  } else {
    return {};
  }
});

const userPlayerStyle = computed(() => {
  if (props.userPlayer) {
    return {
      "text-success":
        playerResearchLevel.value <  userPlayerResearchLevel.value!,
      "text-danger":
        playerResearchLevel.value > userPlayerResearchLevel.value!,
    };
  } else {
    return {};
  }
});
</script>
<style scoped>
.row-icon {
  width: 1%;
}
</style>
