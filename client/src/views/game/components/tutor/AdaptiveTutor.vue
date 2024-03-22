<template>
  <div v-if="isVisible">
    <concept-list id="conceptList" :activeConcept="activeConcept" :filter="filter" :filteredConcepts="filteredConcepts"
      :isExpanded="isExpanded" :isSelectedConcept="isSelectedConcept" :relaxDesire="relaxDesire"
      @selectConcept="selectConcept" @focusConcept="focusConcept" @unfocusConcept="unfocusConcept"
      @clearFilter="clearFilter" @updateFilter="updateFilter" @resetKnowledge="resetKnowledge" @toggle="toggle" />
    <concept-detail id="conceptDetail" v-if="activeConcept" :concept="activeConcept"
      :isSelectedConcept="isSelectedConcept" @onMarkLearned="onMarkLearned" @onCloseRequested="onCloseDetail" />
  </div>
</template>

<script>
import eventBus from '../../../../eventBus'
import AudioService from '../../../../game/audio'
import GameHelper from '../../../../services/gameHelper'
import MENU_STATES from '../../../../services/data/menuStates'
import CONCEPTS from '../../../../services/data/concepts'
import ConceptDetail from './ConceptDetail.vue'
import ConceptList from './ConceptList.vue'

const MAX_VISIBLE_CONCEPTS = 5
const DEFAULT_RELAX_DESIRE = 5
const OVERLAY_WIDTH = 992

export default {
  components: {
    'concept-detail': ConceptDetail,
    'concept-list': ConceptList,
  },
  data() {
    return {
      CONCEPTS: CONCEPTS.sort((a, b) => a.title.localeCompare(b.title)),
      activeConcept: null,
      filter: "",
      isExpanded: false,
      isVisible: false,
      isSelectedConcept: false,
      interval: null,
      relaxDesire: 0,
    }
  },
  mounted() {
    window.addEventListener('resize', this.updateVisible)

    // TODO: These event names should be global constants
    eventBus.$on('onConceptUsed', this.onConceptUsed)
    eventBus.$on('onMenuRequested', this.onMenuRequested)
    if (this.isUserInGame && !this.isTutorialGame) {
      this.updateVisible()
      this.interval = setInterval(this.updateVisibleConcepts, 1000)
      this.clearVisible()
    }
    this.loadKnowledge()
  },
  destroyed() {
    eventBus.$off('onConceptUsed', this.onConceptUsed)
    eventBus.$off('onMenuRequested', this.onMenuRequested)
    window.removeEventListener('resize', this.updateVisible)
    clearInterval(this.interval)
  },
  methods: {
    toggle() {
      this.isExpanded = !this.isExpanded
      this.trackDistraction()
    },
    clearFilter() {
      this.filter = ""
    },
    updateFilter(value) {
      this.filter = value
    },
    clearVisible() {
      for (const c of this.CONCEPTS) {
        this.$delete(c, 'visible')
      }
    },
    loadKnowledge() {
      for (const c of this.CONCEPTS) {
        this.$set(c, 'learned', c.id in this.learnedConcepts)
      }
    },
    async resetKnowledge() {
      if (await this.$confirm('Reset Learned Concepts', 'Are you sure you want to reset all learned concepts?')) {
        for (const c of this.CONCEPTS) {
          this.$set(c, 'learned', false)
          this.$delete(c, 'progress')
          this.$delete(c, 'visible')
        }
        this.$store.commit('clearLearnedConcepts')
        this.relaxDesire = DEFAULT_RELAX_DESIRE
      }
    },
    selectConcept(concept) {
      this.activeConcept = concept
      this.isSelectedConcept = true
      this.trackDistraction()
    },
    focusConcept(concept) {
      if (!this.isSelectedConcept) {
        this.activeConcept = concept
      }
    },
    unfocusConcept() {
      if (!this.isSelectedConcept) {
        this.activeConcept = null
      }
    },
    updateVisibleConcepts() {
      if (this.visibleConcepts.length >= MAX_VISIBLE_CONCEPTS)
        return

      if (this.isExpanded)
        return

      this.relaxDesire = Math.max(this.relaxDesire - 1, 0)

      if (this.relaxDesire <= 0) {
        const concept = this.findNextConcept()
        if (concept === null) {
          return
        }
        this.$set(concept, 'visible', Date.now())
        this.trackDistraction(DEFAULT_RELAX_DESIRE + this.visibleConcepts.length * DEFAULT_RELAX_DESIRE)
        AudioService.click()
      }
    },
    findNextConcept() {
      let bestPriority = -1
      let candidates = []
      for (const c of this.CONCEPTS) {
        if (this.isCandidate(c)) {
          if (c.priority < bestPriority || bestPriority === -1) {
            bestPriority = c.priority
            candidates = [c]
          } else if (c.priority === bestPriority) {
            candidates.push(c)
          }
        }
      }
      if (candidates.length) {
        return candidates[candidates.length * Math.random() | 0]
      }
      return null
    },
    isCandidate(concept) {
      if (concept.learned)
        return false
      if (concept.visible)
        return false
      if (concept.pre) {
        for (const id of concept.pre) {
          if (!(id in this.learnedConcepts))
            return false
        }
      }
      if (concept.isAvailable && !concept.isAvailable.call(this, concept))
        return false
      return true
    },
    markLearned(concept) {
      this.$set(concept, 'learned', true)
      this.$store.commit('setLearnedConcept', concept.id)
      if (concept.visible) {
        AudioService.backspace()
        this.trackDistraction()
        this.$set(concept, 'visible', false)
      }
      this.$delete(concept, 'progress')
      if (this.isSelectedConcept) {
        this.onCloseDetail()
      }
    },
    markProgress(concept, progress = 10) {
      this.$set(concept, 'progress', Math.min((concept.progress || 0) + progress, 100))
      if (concept.progress >= 100) {
        this.markLearned(concept)
      }
    },
    trackDistraction(weight = DEFAULT_RELAX_DESIRE) {
      this.relaxDesire = Math.max(this.relaxDesire, weight)
    },
    onCloseDetail() {
      this.activeConcept = null
      this.isSelectedConcept = false
      this.trackDistraction()
    },
    onMarkLearned(concept) {
      this.markLearned(concept)
    },
    onConceptUsed(conceptId) {
      for (const concept of this.CONCEPTS) {
        if (concept.id === conceptId && !concept.learned && concept.onConceptUsed) {
          concept.onConceptUsed.call(this, concept)
          this.trackDistraction()
        }
      }
    },
    onMenuRequested(menuState) {
      this.updateVisible()
      for (const concept of this.CONCEPTS) {
        if (!concept.learned && concept.onMenuRequested) {
          concept.onMenuRequested.call(this, concept, menuState)
        }
      }
      this.trackDistraction()
    },
    updateVisible () {
      this.isVisible = this.isUserInGame && !this.isTutorialGame && (this.isOverlay() || this.$store.state.menuState == MENU_STATES.NONE)
    },
    isOverlay (e) {
      return window.innerWidth >= OVERLAY_WIDTH
    },
  },
  computed: {
    visibleConcepts() {
      return this.CONCEPTS.filter(c => c.visible).sort(function (a, b) { return a.visible - b.visible })
    },
    filteredConcepts() {
      if (this.isExpanded) {
        if (this.filter) {
          return this.CONCEPTS.filter(c => c.title.toLowerCase().includes(this.filter.toLowerCase()))
        } else {
          return this.CONCEPTS
        }
      } else {
        return this.visibleConcepts
      }
    },
    learnedConcepts() {
      return this.$store.state.learnedConcepts || {}
    },
    isGameInProgress() {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    isUserInGame() {
      return GameHelper.getUserPlayer(this.$store.state.game) != null
    },
    isTutorialGame() {
      return GameHelper.isTutorialGame(this.$store.state.game)
    },
  }
}
</script>

<style scoped>
#conceptDetail {
  position: absolute;
  right: 180px;
  width: 290px;
  top: 45px;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

#conceptList {
  position: absolute;
  right: 0px;
  width: 180px;
  top: 45px;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

@media screen and (max-width: 992px) {
  #conceptDetail {
    top: 130px;
  }
}

@media screen and (max-width: 654px) {
  #conceptDetail, #conceptList {
    top: 130px;
  }
}

@media screen and (max-width: 576px) {
  #conceptDetail, #conceptList {
    top: 100px;
  }
}
</style>
