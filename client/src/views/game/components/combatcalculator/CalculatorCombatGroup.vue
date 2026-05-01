<template>
  <div class="group-box" :class="hasError ? 'group-box-error' : 'group-box-ok'">
    <div>

    </div>
    <div class="group-box-group">
      <button class="btn btn-success" :disabled="otherGroupHasStar" @click="addStar">
        Add Star
      </button>
      <button class="btn btn-success" @click="addCarrier">
        Add Carrier
      </button>
      <button class="btn btn-danger" @click="remove">
        Delete
      </button>
    </div>
    <div class="group-box-footer">
      <p v-for="err of validationErrors" class="text-danger">{{ err }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type {CombatBaseCarrier, CombatBasePlayer, CombatBaseStar, CombatGroup} from "@solaris/common";

type CG = CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>;

const props = defineProps<{
  validationErrors: string[],
  groups: CG[];
}>();

const emit = defineEmits<{
  onGroupRemove: [group: CG],
}>();

const model = defineModel<CG>({ required: true });

const hasError = computed(() => props.validationErrors.length > 0);

const remove = () => emit('onGroupRemove', model.value!);

const otherGroupHasStar = computed(() => Boolean(props.groups.find((g) => g !== model.value && g.star)));

const addStar = () => {
  model.value!.star = {
    _id: "star",
    ships: 0,
    specialistId: null,
    ownedByPlayerId: null,
  };
};

const addCarrier = () => {
  const idx = model.value!.carriers.length;

  model.value!.carriers.push({
    _id: `carrier${idx}`,
    ships: 0,
    specialistId: null,
    specialistTargetedPlayers: [],
    ownedByPlayerId: null,
  });
};
</script>
<style scoped>
.group-box {
  display: flex;
  flex-direction: column;
  border: blue 2px solid;
  border-radius: 4px;
}

.group-box-error {
  border-color: red;
}

.group-box-ok {
  border-color: blue;
}

.group-box-group {
  display: flex;
  flex-direction: row;
}
</style>
