<template>
  <div>
    <div class="table-responsive mt-2">
      <table class="table table-sm">
        <tr>
          <th>{{ title }}</th>
          <th>Before</th>
          <th>Lost</th>
          <th>After</th>
        </tr>
        <template v-for="participant of side.participants">
          <tr>
            <td colspan="4" class="participant-alias">
              <PlayerIcon :player-id="participant.player._id" :solid-glyph-only="true" />
              <span class="participant-name">{{ participant.player.alias }}</span>
            </td>
          </tr>
          <tr v-for="actor of participant.group">
            <CombatActorDescription :actor="actor" :specialist="actor.specialist" />
            <td>{{ actor.before }}</td>
            <td>{{ actor.lost }}</td>
            <td>{{ actor.after }}</td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { type CombatSide } from '../../../../../types/combat';
import type { Store } from 'vuex/types/index.js';
import type { State } from '../../../../../store';
import CombatActorDescription from './CombatActorDescription.vue';
import PlayerIcon from "../../../../game/components/player/PlayerIcon.vue";

const props = defineProps<{
  title: string,
  side: CombatSide,
}>();

const store = useStore() as Store<State>;

</script>
<style scoped>
.participant-alias {
  font-weight: bold;
}

.participant-name {
  margin-left: 4px;
}
</style>
