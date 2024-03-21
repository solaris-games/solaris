<template>
  <div class="d-none d-lg-block" v-if="isUserInGame && !isTutorialGame">
    <div id="conceptList" class="header-bar-bg container pt-1">
      <div class="row">
        <div class="col pt-2">
          <h6>Learning Helper</h6>
          <code v-if="isDevelopment">DEBUG R={{ this.relaxDesire }}</code>
        </div>
        <div class="col-auto">
            <slot></slot>
            <button v-if="isExpanded" @click="toggle" class="btn btn-outline-warning btn-sm"><i class="fas fa-minus"></i></button>
            <button v-if="!isExpanded" @click="toggle" class="btn btn-outline-warning btn-sm"><i class="fas fa-plus"></i></button>
        </div>
      </div>
      <div v-if="isExpanded" class="input-group">
        <input v-model="filter" class="form-control form-control-sm" placeholder="Filter..."/>
        <div class="input-group-append">
          <button @click="clearFilter" class="btn btn-outline-secondary btn-sm" type="button"><i class="fas fa-times"></i></button>
          <button @click="resetKnowledge" class="btn btn-outline-danger btn-sm" type="button"><i class="fas fa-eraser"></i></button>

        </div>
      </div>
      <div>
        <ul class="list-unstyled">
          <li v-for="(concept, index) in filteredConcepts" role="button" class="concept-item" :class="{'selected': concept === activeConcept && isSelectedConcept, 'learned': concept.learned}"
            @click="selectConcept(concept);" @mouseenter="focusConcept(concept);" @mouseleave="unfocusConcept();">
            <p class="small lh-sm m-0 p-1">
              {{ concept.title }}<span class="text-muted" v-if="!concept.learned && concept.progress"> ({{ concept.progress }}%)</span>
            </p>
          </li>
        </ul>
      </div>
    </div>

    <div id="conceptDetail" v-if="activeConcept" class="header-bar-bg container">
      <menu-title v-if="isSelectedConcept" :title="activeConcept.title" @onCloseRequested="onCloseDetail"/>
      <h4 v-if="!isSelectedConcept" class="pt-2">{{ activeConcept.title }}</h4>
      <div>
        <p v-for="para in activeConcept.text.split('\n')" v-html="para">
        </p>
        <p v-if="!activeConcept.learned">
          <div class="progress" v-if="activeConcept.progress">
            <div class="progress-bar" role="progressbar" :style="progressStyle" :aria-valuenow="activeConcept.progress" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </p>
        <div v-if="isSelectedConcept">
          <p class="text-center"><button class="btn btn-sm btn-success" v-if="!activeConcept.learned" @click="onMarkLearned">Mark as Learned</button></p>
          <p v-if="activeConcept.learned" class="text-center text-muted">Already Learned</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import eventBus from '../../../../eventBus'
import AudioService from '../../../../game/audio'
import GameHelper from '../../../../services/gameHelper'
import MenuTitle from '../MenuTitle'
import CONCEPTS from '../../../../services/data/concepts'

const MAX_VISIBLE_CONCEPTS = 5
const DEFAULT_RELAX_DESIRE = 5

export default {
  components: {
    'menu-title': MenuTitle
  },
  data () {
    return {
      CONCEPTS: CONCEPTS.sort((a, b) => a.title.localeCompare(b.title)),
      activeConcept: null,
      filter: "",
      isExpanded: false,
      isFocusedConcept: false,
      isSelectedConcept: false,
      interval: null,
      relaxDesire: 0,
      isDevelopment: process.env.NODE_ENV == 'development'
    }
  },
  mounted () {
    // TODO: These event names should be global constants
    eventBus.$on('onConceptUsed', this.onConceptUsed)
    eventBus.$on('onMenuRequested', this.onMenuRequested)
    if (this.isUserInGame && !this.isTutorialGame) {
      this.interval = setInterval(this.updateVisibleConcepts, 1000)
      this.clearVisible()
    }
    this.loadKnowledge()
  },
  destroyed () {
    eventBus.$off('onConceptUsed', this.onConceptUsed)
    eventBus.$off('onMenuRequested', this.onMenuRequested)
    clearInterval(this.interval)
  },
  methods: {
    toggle () {
      this.isExpanded = !this.isExpanded
      this.trackDistraction()
    },
    clearFilter () {
      this.filter = ""
    },
    clearVisible () {
      for (const c of this.CONCEPTS) {
        this.$delete(c, 'visible')
      }
    },
    loadKnowledge () {
      for (const c of this.CONCEPTS) {
        this.$set(c, 'learned', c.id in this.learnedConcepts)
      }
    },
    resetKnowledge () {
      for (const c of this.CONCEPTS) {
        this.$set(c, 'learned', false)
        this.$delete(c, 'progress')
      }
      this.$store.commit('clearLearnedConcepts')
    },
    selectConcept (concept) {
      this.activeConcept = concept
      this.isSelectedConcept = true
      this.trackDistraction()
    },
    focusConcept (concept) {
      if (!this.isSelectedConcept) {
        this.activeConcept = concept
        this.isFocusedConcept = true
      }
    },
    unfocusConcept () {
      if (!this.isSelectedConcept) {
        this.activeConcept = null
        this.isFocusedConcept = false
      }
    },
    updateVisibleConcepts () {
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
    findNextConcept () {
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
    isCandidate (concept) {
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
    markLearned (concept) {
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
    markProgress(concept, progress=10) {
      this.$set(concept, 'progress', Math.min((concept.progress || 0) + progress, 100))
      if (concept.progress >= 100) {
        this.markLearned(concept)
      }
    },
    trackDistraction (weight = DEFAULT_RELAX_DESIRE) {
      this.relaxDesire = Math.max(this.relaxDesire, weight)
    },
    onCloseDetail () {
      this.activeConcept = null
      this.isSelectedConcept = false
      this.trackDistraction()
    },
    onMarkLearned () {
      this.markLearned(this.activeConcept)
    },
    onConceptUsed (conceptId) {
      for (const concept of this.CONCEPTS) {
        if (concept.id === conceptId && !concept.learned && concept.onConceptUsed) {
          concept.onConceptUsed.call(this, concept)
          this.trackDistraction()
        }
      }
    },
    onMenuRequested (menuState) {
      for (const concept of this.CONCEPTS) {
        if (!concept.learned && concept.onMenuRequested) {
          concept.onMenuRequested.call(this, concept, menuState)
        }
      }
      this.trackDistraction()
    },
  },
  computed: {
    visibleConcepts () {
      return this.CONCEPTS.filter(c => c.visible).sort(function (a, b) { return a.visible - b.visible })
    },
    filteredConcepts () {
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
    learnedConcepts () {
      return this.$store.state.learnedConcepts || {}
    },
    isGameInProgress () {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    isUserInGame () {
      return GameHelper.getUserPlayer(this.$store.state.game) != null
    },
    isTutorialGame () {
      return GameHelper.isTutorialGame(this.$store.state.game)
    },
    progressStyle () {
      return {
        width: this.activeConcept.progress + "%",
      };
    },
  }
}
</script>

<style scoped>
#conceptList {
  position: absolute;
  right: 0px;
  width: 180px;
  top: 45px;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

#conceptList .concept-item:hover {
  background-color: darkslategray;
}

#conceptList .concept-item.selected {
  background-color: gray;
}

#conceptList .concept-item.learned {
  background-color: black;
}

#conceptList .concept-item.selected.learned {
  background-color: lightslategray;
}

#conceptDetail {
  position: absolute;
  right: 180px;
  width: 290px;
  top: 45px;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-width: none;
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
