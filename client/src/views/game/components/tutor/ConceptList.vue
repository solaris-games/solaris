<template>
  <div class="header-bar-bg container pt-1">
    <div class="row">
      <div class="col pt-2">
        <h6>Learning Helper</h6>
        <code v-if="isDevelopment">DEBUG R={{ relaxDesire }}</code>
      </div>
      <div class="col-auto">
        <slot></slot>
        <button v-if="isExpanded" @click="toggle" class="btn btn-outline-warning btn-sm"><i
            class="fas fa-minus"></i></button>
        <button v-if="!isExpanded" @click="toggle" class="btn btn-outline-warning btn-sm"><i
            class="fas fa-plus"></i></button>
      </div>
    </div>
    <div v-if="isExpanded" class="input-group">
      <input :value="filter" @input="updateFilter" class="form-control form-control-sm" placeholder="Filter..." />
      <div class="input-group-append">
        <button @click="clearFilter" class="btn btn-outline-secondary btn-sm" type="button"><i
            class="fas fa-times"></i></button>
        <button @click="resetKnowledge" class="btn btn-outline-danger btn-sm" type="button"><i
            class="fas fa-eraser"></i></button>
      </div>
    </div>
    <div>
      <ul class="list-unstyled">
        <concept-list-item v-for="concept in filteredConcepts" v-bind:key="concept.id" :concept="concept"
          :isSelected="concept === activeConcept && isSelectedConcept" @selectConcept="selectConcept"
          @focusConcept="focusConcept" @unfocusConcept="unfocusConcept" />
      </ul>
    </div>
  </div>
</template>

<script>
import ConceptListItem from './ConceptListItem.vue'

export default {
  components: {
    'concept-list-item': ConceptListItem,
  },
  data() {
    return {
      isDevelopment: process.env.NODE_ENV == 'development'
    }
  },
  props: {
    activeConcept: Object,
    filter: String,
    filteredConcepts: Array,
    isExpanded: Boolean,
    isSelectedConcept: Boolean,
    relaxDesire: Number
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
    clearFilter() {
      this.$emit('clearFilter')
    },
    updateFilter(e) {
      this.$emit('updateFilter', e.target.value)
    },
    resetKnowledge() {
      this.$emit('resetKnowledge')
    },
    toggle() {
      this.$emit('toggle')
    },
  },
}
</script>

<style scoped></style>
