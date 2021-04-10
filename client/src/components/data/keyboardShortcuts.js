import MENU_STATES from './menuStates'

export default {
  generic: {
    '27': null, // Esc
    '81': MENU_STATES.LEADERBOARD, // Q
    '67': MENU_STATES.COMBAT_CALCULATOR, // C
    '86': MENU_STATES.RULER, // V
    '73': MENU_STATES.INTEL, // I
    '79': MENU_STATES.OPTIONS, // O
    '187': 'ZOOM_IN', // +
    '189': 'ZOOM_OUT', // -
    '90': 'FIT_GALAXY' // Z
  },
  player: {
    '72': 'HOME_STAR', // H
    '32': 'HOME_STAR', // Space
    '82': MENU_STATES.RESEARCH, // R
    '71': `${MENU_STATES.GALAXY}|stars`, // G
    '70': `${MENU_STATES.GALAXY}|carriers`, // F
    '83': `${MENU_STATES.GALAXY}|ships`, // S
    '77': MENU_STATES.INBOX, // M
    '78': MENU_STATES.GAME_NOTES, // N
    '76': MENU_STATES.LEDGER, // L
    '66': MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE, // B
  }
}
