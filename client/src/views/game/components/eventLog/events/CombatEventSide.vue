<template>
  <div>
    <div class="table-responsive mt-2">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>{{ title }}</th>
            <th>Before</th>
            <th>Lost</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="4" class="weapons-level">
              Weapons {{ side.weaponsLevel }}
            </td>
          </tr>
          <template v-for="participant of side.participants">
            <tr>
              <td colspan="4">
                <button class="btn btn-link participant-alias" @click="requestOpenPlayerDetail(participant.player._id)">
                  <PlayerIcon :player-id="participant.player._id" :solid-glyph-only="true" />
                  <span class="participant-name">{{ participant.player.alias }}</span>
                </button>
              </td>
            </tr>
            <tr v-for="actor of participant.group">
              <CombatActorDescription :actor="actor" :specialist="actor.specialist" />
              <td>{{ actor.before }}</td>
              <td>{{ actor.lost }}</td>
              <td>{{ actor.after }}</td>
            </tr>
          </template>
          <tr>
            <td class="combat-side-total">Total</td>
            <td class="combat-side-total">{{ totals.before }}</td>
            <td class="combat-side-total">{{ totals.lost }}</td>
            <td class="combat-side-total">{{ totals.after }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { type CombatSide, resultToNumber } from '../../../../../services/combat';
import type { Store } from 'vuex/types/index.js';
import type { State } from '../../../../../store';
import CombatActorDescription from './CombatActorDescription.vue';
import PlayerIcon from "../../../../game/components/player/PlayerIcon.vue";
import { computed } from 'vue';

const props = defineProps<{
  title: string,
  side: CombatSide,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const store = useStore() as Store<State>;

const requestOpenPlayerDetail = (playerId: string) => {
  emit('onOpenPlayerDetailRequested', playerId);
};

const totals = computed(() => {
  return props.side.participants.map(participant => {
    return participant.group.reduce((acc, actor) => {
      acc.before += resultToNumber(actor.before);
      acc.lost += resultToNumber(actor.lost);
      acc.after += resultToNumber(actor.after);
      return acc;
    }, { before: 0, lost: 0, after: 0 });
  }).reduce((acc, participant) => {
    acc.before += participant.before;
    acc.lost += participant.lost;
    acc.after += participant.after;
    return acc;
  }, { before: 0, lost: 0, after: 0 });
})

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
