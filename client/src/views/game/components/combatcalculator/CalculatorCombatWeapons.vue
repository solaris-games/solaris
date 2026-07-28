<template>
  <div v-if="model" class="p-2 mb-1 cg-weapons">
    <div class="cg-weapons-inputs input-group mb-1">
      <span class="input-group-text">
        <i class="fas fa-gun"></i>
      </span>
      <select class="form-select form-select-sm" v-model="model.kind">
        <option value="level">Level</option>
        <option value="players">Players</option>
      </select>
      <input
        v-if="model.kind === 'level'"
        type="number"
        min="1"
        class="form-control form-control-sm"
        v-model.number="model.level"
      />
      <select
        v-if="model.kind === 'players'"
        class="form-select form-select-sm"
        v-model="model.players"
        multiple
      >
        <option v-for="player in players" :key="player._id" :value="player">
          {{ player.alias }}
        </option>
      </select>
    </div>
    <p v-if="model.kind === 'players' && model.players?.length" class="mb-1">
      Effective level: {{ effectiveLevel }}
    </p>
  </div>
</template>
<script setup lang="ts">
import { computed, watch } from "vue";
import type { CCGroupWeaponsSpec } from "@/views/game/components/combatcalculator/types";
import type { Player } from "@/types/game";
import { useGameServices } from "@/util/gameServices.ts";

const props = defineProps<{
  players: Player[];
}>();

const model = defineModel<CCGroupWeaponsSpec>();

watch(model, (_oldVal, newVal) => {
  if (newVal && newVal.kind === "players" && !newVal.players) {
    newVal.players = [];
  }
});

const serviceProvider = useGameServices();

const effectiveLevel = computed(() => {
  if (model.value?.kind === "players") {
    return serviceProvider.technologyService
      .getBaseWeapons(model.value.players || [])
      .toString();
  }

  return "";
});
</script>
<style scoped>
.cg-weapons {
  border: 1px white solid;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.cg-weapons-inputs {
  display: flex;
  flex-direction: row;
}
</style>
