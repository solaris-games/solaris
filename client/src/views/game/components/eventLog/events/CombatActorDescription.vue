<template>
  <td class="combat-actor-name">
    <span>
      <specialist-icon :specialist="specialist" :default-icon="kind === 'star' ? 'star' : 'rocket'" />
    </span>
    {{ name }}
  </td>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type CombatActor } from '../../../../../types/combat';
import { type Store, useStore } from 'vuex';
import type { State } from '../../../../../store';
import SpecialistIcon from "../../specialist/SpecialistIcon.vue";
import type {Specialist} from "@solaris-common";

const props = defineProps<{
  actor: CombatActor,
  specialist: Specialist | null,
}>();

const store = useStore() as Store<State>;

const kind = computed(() => props.actor.object.kind);
const name = computed(() => props.actor.object.kind === 'star' ? props.actor.object.starName : props.actor.object.carrier.name);
</script>
<style scoped>
.combat-actor-name {
  padding-left: 8px;
  width: 50%;
}
</style>
