<template>
  <div class="d-none d-lg-block" v-if="isUserInGame">
    <div id="conceptList" class="header-bar-bg container pt-1">
      <div class="row">
        <div class="col pt-2">
          <h6>Learning Helper</h6>
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
        </div>
      </div>
      <div>
        <ul class="list-unstyled">
          <li v-for="(concept, index) in filteredConcepts"  class="concept-item" :class="{'selected': concept === activeConcept && isSelectedConcept, 'learned': concept.learned}"
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
import GameHelper from '../../../../services/gameHelper'
import MenuTitle from '../MenuTitle'
import CONCEPTS from '../../../../services/data/concepts'

export default {
  components: {
    'menu-title': MenuTitle
  },
  data () {
    return {
      CONCEPTS: CONCEPTS,
      activeConcept: null,
      filter: "",
      isExpanded: false,
      isFocusedConcept: false,
      isSelectedConcept: false,
    }
  },
  mounted () {
    // TODO: These event names should be global constants
    eventBus.$on('onMenuRequested', this.onMenuRequested)
    eventBus.$on('onZoom', this.onZoom)
  },
  destroyed () {
    eventBus.$off('onMenuRequested', this.onMenuRequested)
    eventBus.$off('onZoom', this.onZoom)
  },
  methods: {
    toggle () {
      this.isExpanded = !this.isExpanded
    },
    clearFilter () {
      this.filter = ""
    },
    selectConcept (concept) {
      this.activeConcept = concept
      this.isSelectedConcept = true
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
    markLearned (concept, progress=null) {
      if (progress) {
        this.$set(concept, 'progress', Math.min((concept.progress || 0) + progress, 100))
      }
      if (!progress || concept.progress === 100) {
        this.$set(concept, 'learned', true)
      }
      if (this.isSelectedConcept && concept.learned) {
        this.onCloseDetail()
      }
    },
    onCloseDetail () {
      this.activeConcept = null
      this.isSelectedConcept = false
    },
    onMarkLearned () {
      this.markLearned(this.activeConcept)
    },
    onMenuRequested (menuState) {
      for (const concept of this.CONCEPTS) {
        if (!concept.learned && concept.onMenuRequested) {
          concept.onMenuRequested.call(this, concept, menuState)
        }
      }
    },
    onZoom () {
      for (const concept of this.CONCEPTS) {
        if (!concept.learned && concept.onZoom) {
          concept.onZoom.call(this, concept)
        }
      }
    }
  },
  computed: {
    filteredConcepts () {
      if (this.isExpanded) {
        if (this.filter) {
          return this.CONCEPTS.filter(c => c.title.toLowerCase().includes(this.filter.toLowerCase()))
        } else {
          return this.CONCEPTS
        }
      } else {
        return this.CONCEPTS.filter(c => !c.learned)
      }
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
