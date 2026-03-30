<template>
  <div class="row" v-if="player && player.reputation">
    <div class="col">
      <p class="mb-1">
        <small>
          <i>
            Your reputation with this player is <span :class="{'text-danger':player.reputation.score < 0,'text-success':player.reputation.score > 0}">{{player.reputation.score}}</span>.
          </i>
        </small>
      </p>
      <p v-if="isExtraDark" class="mb-1 text-warning">
        <small>
          <i>
            Warning: since this game is extra dark, these values are estimates based on your current scanning range.
          </i>
        </small>
      </p>
      <p class="mb-1">
        <small>
          <i>
            Send Credits (<span class="text-warning">${{creditsRequired}}</span>)
            <span v-if="isSpecialistsCurrencyCreditsSpecialists">Specialist Tokens (<span class="text-warning">{{creditsSpecialistsRequired}}</span>)</span> or Technology to increase your reputation.
          </i>
        </small>
      </p>
      <p class="mb-1" v-if="isFormalAlliancesEnabled">
        <small>
          <i>
            <span>Reputation greater or equal to <span class="text-warning">5</span> will change their diplomatic status to <span class="text-success">Allied</span>.</span>
          </i>
        </small>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import type {Game} from "@/types/game";

const props = defineProps<{
  playerId: string,
}>();

const store = useStore();
const game = computed<Game>(() => store.game);
const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);

const isExtraDark = computed(() => GameHelper.isDarkModeExtra(game.value));

const isFormalAlliancesEnabled = computed(() => DiplomacyHelper.isFormalAlliancesEnabled(game.value));

const isSpecialistsCurrencyCreditsSpecialists = computed(() => GameHelper.isSpecialistsCurrencyCreditsSpecialists(game.value));

const creditsSpecialistsRequired = computed(() => Math.round(player.value.research.specialists.level / 2));

const creditsRequired = computed(() => player.value.stats!.totalEconomy * 10 / 2);
</script>

<style scoped>
</style>
