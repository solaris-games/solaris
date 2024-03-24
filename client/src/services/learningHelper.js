import eventBus from '../eventBus'

const CONCEPT_IDS = {
  BULK_UPGRADE: 'bulk-upgrade',
  CAMERA_PAN: 'camera-pan',
  CAMERA_ZOOM: 'camera-zoom',
  CAPITAL_STAR: 'capital-star',
  CARRIERS: 'carriers',
  COMBAT_CALCULATOR: 'combat-calculator',
}

class LearningHelper {
  concept = CONCEPT_IDS

  conceptUsed(conceptId) {
    eventBus.$emit('onConceptUsed', conceptId)
  }
}

export default new LearningHelper()
