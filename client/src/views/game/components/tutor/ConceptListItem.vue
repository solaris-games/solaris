<template>
  <li role="button" class="concept-item" :class="{ 'selected': isSelected, 'learned': concept.learned }"
    @click="selectConcept(concept);" @mouseenter="focusConcept(concept);" @mouseleave="unfocusConcept();">
    <p class="small lh-sm m-0 p-1">
      {{ concept.title }}<span class="text-muted" v-if="!concept.learned && concept.progress"> ({{ concept.progress
        }}%)</span>
    </p>
  </li>
</template>

<script>

export default {
  props: {
    concept: Object,
    isSelected: Boolean,
  },
  methods: {
    selectConcept(concept) {
      this.$emit('selectConcept', concept)
    },
    focusConcept(concept) {
      this.$emit('focusConcept', concept)
    },
    unfocusConcept() {
      this.$emit('unfocusConcept')
    },
  },
}
</script>

<style scoped>
.concept-item.selected {
  background-color: gray;
}

.concept-item.learned {
  background-color: black;
}

.concept-item.selected.learned {
  background-color: lightslategray;
}

.concept-item:hover {
  background-color: darkslategray;
}

.highlight-enter-active {
  animation: blinker 500ms linear;
}

@keyframes blinker {
  0% {
    background-color: transparent;
  }

  50% {
    background-color: yellow;
  }

  100% {
    background-color: transparent;
  }
}
</style>
