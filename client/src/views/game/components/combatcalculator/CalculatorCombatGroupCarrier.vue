<template>
<div class="cg-group-carrier">
  <p>Hello there! I am a carrier!</p>
  <button class="btn btn-sm btn-danger" @click="remove">
    X
  </button>
</div>
</template>
<script setup lang="ts">
import type {CombatBaseCarrier} from "@solaris/common";

const emit = defineEmits<{
  onRemove: [],
}>();

const model = defineModel<CombatBaseCarrier<string>>({ required: true });

const remove = () => emit('onRemove');
</script>
<style scoped>
.cg-group-carrier {

}
</style>
