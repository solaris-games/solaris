<template>
  <div class="header-bar-bg container">
    <menu-title v-if="isSelectedConcept" :title="concept.title" @onCloseRequested="onCloseRequested" />
    <h4 v-if="!isSelectedConcept" class="pt-2">{{ concept.title }}</h4>
    <div>
      <p v-for="para in concept.text.split('\n')" v-html="para">
      </p>
      <p v-if="!concept.learned">
      <div class="progress" v-if="concept.progress">
        <div class="progress-bar" role="progressbar" :style="progressStyle" :aria-valuenow="concept.progress"
          aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      </p>
      <div v-if="isSelectedConcept">
        <p class="text-center"><button class="btn btn-sm btn-success" v-if="!concept.learned"
            @click="onMarkLearned(concept)">Mark as Learned</button></p>
        <p v-if="concept.learned" class="text-center text-muted">Already Learned</p>
      </div>
    </div>
  </div>
</template>

<script>
import MenuTitle from '../MenuTitle'

export default {
  components: {
    'menu-title': MenuTitle,
  },
  props: {
    concept: Object,
    isSelectedConcept: Boolean
  },
  methods: {
    onCloseRequested() {
      this.$emit('onCloseRequested')
    },
    onMarkLearned(concept) {
      this.$emit('onMarkLearned', concept)
    },
  },
  computed: {
    progressStyle() {
      return {
        width: this.concept.progress + "%",
      };
    },
  }
}
</script>

<style scoped></style>
