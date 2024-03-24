<template>
  <li role="button" class="concept-item" :class="{ 'selected': isSelected, 'learned': concept.learned, 'blink': isNew }"
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
  computed: {
    isNew() {
      return this.concept.visible && ((Date.now() - this.concept.visible) < 1000)
    }
  }
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

.concept-item.blink {
  animation: blinker 500ms linear;
}

@keyframes blinker {
  0% {
    background-color: transparent;
  }

  50% {
    background-color: #F2A33C;
  }

  100% {
    background-color: transparent;
  }
}
</style>
