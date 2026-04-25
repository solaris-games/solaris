<template>
  <div>
    <div class="table-responsive mt-2">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Group {{ groupIndex }}: {{title }}</th>
            <th>Before</th>
            <th>Lost</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
        <combat-group-attack :group="group" />
        <template v-for="participant in playerGroupedObjects">
            <tr>
              <td colspan="4">
                <button class="btn btn-link participant-alias" @click="requestOpenPlayerDetail(participant.player._id)">
                  <PlayerIcon :player-id="participant.player._id" :solid-glyph-only="true" />
                  <span class="participant-name">{{ participant.player.alias }}</span>
                </button>
              </td>
            </tr>
            <tr v-if="participant.star">
              <combat-actor-description :name="participant.star.starName" :specialist="getSpecialist(participant.star.specialistId, 'star')" kind="star" />
              <td>{{ participant.star.shipsBefore }}</td>
              <td>{{ participant.star.shipsLost }}</td>
              <td>{{ participant.star.shipsAfter }}</td>
            </tr>
            <tr v-for="carrier of participant.carriers">
              <combat-actor-description :name="carrier.carrierName" :specialist="getSpecialist(carrier.specialistId, 'carrier')" kind="carrier" />
              <td>{{ carrier.shipsBefore }}</td>
              <td>{{ carrier.shipsLost }}</td>
              <td>{{ carrier.shipsAfter }}</td>
            </tr>
          </template>
          <tr>
            <td class="combat-side-total">Total</td>
            <td class="combat-side-total">{{ group.shipsBefore }}</td>
            <td class="combat-side-total">{{ group.shipsLost }}</td>
            <td class="combat-side-total">{{ group.shipsAfter }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import CombatActorDescription from './CombatActorDescription.vue';
import PlayerIcon from "../../../player/PlayerIcon.vue";
import { computed } from 'vue';
import {type CombatResultCarrier, type CombatResultGroup, type CombatResultStar, groupBy} from "@solaris/common";
import CombatGroupAttack from "@/views/game/components/eventLog/events/combat/CombatGroupAttack.vue";
import type {Game, Player} from "@/types/game";
import GameHelper from "@/services/gameHelper";

type Participant = {
  player: Player,
  star: CombatResultStar<string> | undefined,
  carriers: CombatResultCarrier<string>[],
}

const props = defineProps<{
  title: string,
  group: CombatResultGroup<string>,
  groupIndex: number,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const requestOpenPlayerDetail = (playerId: string) => {
  emit('onOpenPlayerDetailRequested', playerId);
};

const getSpecialist = (id: number | null, kind: 'star' | 'carrier') => {
  if (id === null) {
    return null;
  }

  return store.getSpecialist(id, kind);
};

const playerGroupedObjects = computed(() => {
  const groupedMap = groupBy(props.group.carriers, (c) => c.ownedByPlayerId);

  const grouped: Participant[] = [];

  for (let [playerId, carriers] of groupedMap) {
    const player = GameHelper.getPlayerById(game.value, playerId)!;

    const entry: Participant = {
      player,
      carriers,
      star: (props.group.star && props.group.star.ownedByPlayerId === playerId) ? props.group.star : undefined,
    };

    grouped.push(entry);
  }

  grouped.sort((pa1, pa2) => {
    if (pa1.star) {
      return -1;
    }

    if (pa2.star) {
      return 1;
    }

    return 0;
  });

  return grouped;
});
</script>
<style scoped>
.participant-alias {
  font-weight: bold;
}

.participant-name {
  margin-left: 8px;
}

.combat-side-total {
  font-weight: bold;
}

.weapons-level {
  font-style: italic;


}
</style>
