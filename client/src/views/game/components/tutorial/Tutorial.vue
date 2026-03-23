<template>
<div class="menu-page container pb-2">
    <menu-title :title="title" @onCloseRequested="onCloseRequested"/>

    <div class="row pb-2">
        <div class="col">
            <button type="button" title="Next" class="btn btn-primary" @click="prevPage()" v-if="page > 0"><i class="fas fa-arrow-left me-1"></i>Previous</button>
        </div>
        <div class="col-auto">
            <button type="button" title="Next" class="btn btn-success" @click="nextPage()" v-if="page >= 0 && page < maxPage">Next<i class="fas fa-arrow-right ms-1"></i></button>
        </div>
    </div>

    <component v-bind:is="currentTutorialComponent" v-bind="tutorialProps"></component>

</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import MenuTitle from '../MenuTitle.vue';
import type {Game} from "@/types/game";
import type {TutorialProps} from "@/views/game/components/tutorial/tutorial";

const defaultTutorialKey = "original";

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const onCloseRequested = () => emit('onCloseRequested');

const store = useStore();
const game = computed<Game>(() => store.state.game);
const title = ref("Tutorial");
const tutorialKey = ref(game.value.settings.general.createdFromTemplate || defaultTutorialKey);
const page = ref(0);
const maxPage = ref(0);

const isTutorialCompleted = computed(() => page.value === -1);
const currentTutorialComponent = computed(() => `tutorial-${tutorialKey}`);

const setTutorialCompleted = () => {
  page.value = -1;
  store.commit('setTutorialPage', `${tutorialKey.value}|${page.value}`);
};

const tutorialProps = computed<TutorialProps>(() => ({
  page: page.value,
  game: game.value,
  setTutorial: (t, mp) => {
    title.value = t;
    maxPage.value = mp;
  },
  setTutorialCompleted,
}));

const nextPage = () => {
  page.value = page.value + 1;
  store.commit('setTutorialPage', `${tutorialKey.value}|${page.value}`);
};

const prevPage = () => {
  page.value = Math.max(0, page.value - 1);
  store.commit('setTutorialPage', `${tutorialKey.value}|${page.value}`);
};

onMounted(() => {
  // TODO
  const tutPage: string | number = store.state.tutorialPage || 0;
  if (typeof tutPage === 'string') {
    page.value = Number.parseInt(tutPage.split("|")[1]);
  } else {
    page.value = tutPage;
  }
});
</script>

<style scoped>
</style>
