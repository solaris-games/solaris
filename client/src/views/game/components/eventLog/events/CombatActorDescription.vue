<template>
  <td class="combat-actor-name">{{ name }}</td>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type CombatActor } from '../../../../../types/combat';
import { type Store, useStore } from 'vuex';
import type { State } from '../../../../../store';
import gameHelper from '../../../../../services/gameHelper';

const props = defineProps<{
  actor: CombatActor
}>();

const store = useStore() as Store<State>;

const name = computed(() => props.actor.object.kind === 'star' ? gameHelper.getStarById(store.state.game!, props.actor.object.star._id)!.name : props.actor.object.carrier.name);
</script>
