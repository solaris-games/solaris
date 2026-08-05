import type { KeyboardShortcutsConfig } from "@/services/shortcuts.ts";

export const KEYBOARD_SHORTCUTS: KeyboardShortcutsConfig = {
  all: {
    Escape: { cmd: "setMenuState", state: { state: "none" } },
    q: { cmd: "setMenuState", state: { state: "leaderboard" } },
    "+": { cmd: "mapCommand", command: "zoomIn" },
    "-": { cmd: "mapCommand", command: "zoomOut" },
    z: { cmd: "mapCommand", command: "fitGalaxy" },
  },
  user: {
    c: {
      cmd: "setMenuState",
      state: { state: "combatCalculator", advanced: false },
    },
    v: { cmd: "setMenuState", state: { state: "ruler" } },
    i: { cmd: "setMenuState", state: { state: "intel" } },
    o: { cmd: "setMenuState", state: { state: "options" } },
    a: { cmd: "setMenuState", state: { state: "galaxy", menu: "empires" } },
    g: { cmd: "setMenuState", state: { state: "galaxy", menu: "stars" } },
    f: { cmd: "setMenuState", state: { state: "galaxy", menu: "carriers" } },
    s: { cmd: "setMenuState", state: { state: "galaxy", menu: "ships" } },
    t: { cmd: "setMenuState", state: { state: "galaxy", menu: "technology" } },
  },
  player: {
    h: { cmd: "mapCommand", command: "panToHomeStar" },
    " ": { cmd: "mapCommand", command: "panToHomeStar" },
    r: { cmd: "setMenuState", state: { state: "research" } },
    m: { cmd: "setChatState", state: { state: "inbox" } },
    e: { cmd: "setMenuState", state: { state: "eventLog" } },
    n: { cmd: "setMenuState", state: { state: "gameNotes" } },
    l: { cmd: "setMenuState", state: { state: "ledger" } },
    d: { cmd: "setMenuState", state: { state: "diplomacy" } },
    b: { cmd: "setMenuState", state: { state: "bulkInfrastructureUpgrade" } },
  },
};
