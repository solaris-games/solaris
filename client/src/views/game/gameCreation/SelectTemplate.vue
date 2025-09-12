<template>
  <div class="mb-2">
    <label for="settingsTemplate" class="col-form-label">Settings template</label>
    <select name="settingsTemplate" class="form-control form-inline" v-model="settingsTemplateName">
      <option value="standard">Standard</option>
      <option value="turnBased">Standard TB</option>
      <option value="1v1">1v1 RT</option>
      <option value="1v1turnBased">1v1 TB</option>
      <option value="16player_realTime">16 Player RT</option>
      <option value="16player_turnBased">16 Player TB</option>
      <option value="32player_normal">32 Player experimental</option>
      <option value="32player_ultradark">32 Player classic</option>
      <option value="newPlayer">New Player</option>
      <option value="special_anonymous">Special Anonymous</option>
      <option value="special_arcade">Special Arcade</option>
      <option value="special_battleRoyale">Special Battle Royale</option>
      <option value="special_dark">Special Dark</option>
      <option value="special_fog">Special Fog</option>
      <option value="special_freeForAll">Special Free For All</option>
      <option value="special_homeStar">Special Capital Stars</option>
      <option value="special_homeStarElimination">Special Capital Star Elimination</option>
      <option value="special_kingOfTheHill">Special King of the Hill</option>
      <option value="special_orbital">Special Orbital Rotation</option>
      <option value="special_tinyGalaxy">Special Tiny Galaxy</option>
      <option value="special_ultraDark">Special Ultra Dark</option>
    </select>
    <button class="btn btn-default mt-2" @click="load">Load settings</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  onSelectTemplate: [templateName: string];
}>();

const settingsTemplateName = ref('standard');

const load = () => {
  emit('onSelectTemplate', settingsTemplateName.value);
};
</script>

<style scoped>

</style>
