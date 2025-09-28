<template>
  <p class="mb-1">It is recommended to use the community galaxy generation tool which can be found here: <a href="https://ihateattackmaps.github.io/solaris-custom-galaxy-editor/" target="_blank">https://ihateattackmaps.github.io/solaris-custom-galaxy-editor/</a></p>

  <label for="customGalaxy" class="col-form-label">Galaxy JSON <help-tooltip tooltip="The JSON document for which represents the galaxy to create"/></label>

  <textarea id='customGalaxy' class="customGalaxyJson" v-model='customGalaxy' rows="10" @input="resetValidationState"></textarea>

  <button v-if="customGalaxy" class="btn btn-primary mt-2" @click="validate">Validate</button>

  <div v-if="state && state.state === 'error'" class="alert alert-danger mt-2">
    <p>Invalid galaxy JSON:</p>
    <ul>
      <li v-for="(error, index) in state.errors" :key="index">{{ error }}</li>
    </ul>
  </div>

  <div v-else-if="state && state.state === 'ok'" class="alert alert-success mt-2">
    Valid galaxy JSON!
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HelpTooltip from "@/views/components/HelpTooltip.vue";
import {customGalaxyValidator} from "@solaris-common";

type ValidationState =
  | null
  | { state: 'error', errors: string[] }
  | { state: 'ok' };

const props = defineProps<{
  advanced: boolean,
}>();

const customGalaxy = defineModel<string | undefined>({ default: undefined, required: true });

const state = ref<ValidationState>(null);

const resetValidationState = () => {
  state.value = null;
};

const validate = (e: Event) => {
  e.preventDefault();

  const text = customGalaxy.value;

  if (!text) {
    return;
  }

  try {
    const galaxy = JSON.parse(text);

    customGalaxyValidator(galaxy); // we are not actually interested in the result

    state.value = { state: 'ok' };
  } catch (e) {
    state.value = { state: 'error', errors: [e instanceof Error ? e.message : 'Unknown error'] };
  }
};

</script>

<style scoped>
.customGalaxyJson {
  resize: both;
  display: block;
}
</style>
