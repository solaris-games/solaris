import MENU_STATES from './menuStates'

export default {
  all: {
    'Escape': null,
    'q': MENU_STATES.LEADERBOARD,
    '+': 'ZOOM_IN',
    '-': 'ZOOM_OUT',
    'z': 'FIT_GALAXY'
  },
  user: {
    'c': MENU_STATES.COMBAT_CALCULATOR,
    'v': MENU_STATES.RULER,
    'i': MENU_STATES.INTEL,
    'o': MENU_STATES.OPTIONS,
    'a': `${MENU_STATES.GALAXY}|empires`,
    'g': `${MENU_STATES.GALAXY}|stars`,
    'f': `${MENU_STATES.GALAXY}|carriers`,
    's': `${MENU_STATES.GALAXY}|ships`,
    't': `${MENU_STATES.GALAXY}|technology`
  },
  player: {
    'h': 'HOME_STAR',
    ' ': 'HOME_STAR', // Space
    'r': MENU_STATES.RESEARCH,
    'm': MENU_STATES.INBOX,
    'e': MENU_STATES.EVENT_LOG,
    'n': MENU_STATES.GAME_NOTES,
    'l': MENU_STATES.LEDGER,
    'd': MENU_STATES.DIPLOMACY,
    'b': MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE,
  }
}
