<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="Game Options" @onCloseRequested="onCloseRequested" @onTitleClicked="onTitleClicked"/>

    <options-form v-if="showErrorsCounter < 3" @onOptionsSaved="onCloseRequested" :isInGame="true"/>

    <error-log v-else />
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MenuTitle from '../MenuTitle.vue'
import OptionsForm from './OptionsForm.vue'
import ErrorLog from "./ErrorLog.vue";

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const onCloseRequested = () => emit('onCloseRequested');

const showErrorsCounter = ref(0);

const onTitleClicked = () => showErrorsCounter.value += 1;
</script>

<style scoped>
</style>
