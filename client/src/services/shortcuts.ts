import { inject, computed } from "vue";
import { useUserStore } from "@/stores/user.ts";
import { useGameStore } from "@/stores/game.ts";
import { eventBusInjectionKey } from "@/eventBus.ts";
import { KEYBOARD_SHORTCUTS } from "./data/keyboardShortcuts";
import { MapCommandEventBusEventNames } from "@solaris/map-rendering";
import GameHelper from "@/services/gameHelper.ts";
import type { MenuState, MenuStateChat } from "@/types/menu.ts";

export type ShortcutCommand =
  | { cmd: "setMenuState"; state: MenuState }
  | { cmd: "setChatState"; state: MenuStateChat }
  | {
      cmd: "mapCommand";
      command: "fitGalaxy" | "panToHomeStar" | "zoomIn" | "zoomOut";
    };

export type KeyboardShortcuts = Record<string, ShortcutCommand>;

export type KeyboardShortcutsConfig = {
  all: KeyboardShortcuts;
  user: KeyboardShortcuts;
  player: KeyboardShortcuts;
};

export const createKeyboardShortcutHandler = () => {
  const userStore = useUserStore();
  const store = useGameStore();
  const eventBus = inject(eventBusInjectionKey)!;

  const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
  const game = computed(() => store.game!);

  const panToHomeStar = () => {
    if (userPlayer.value) {
      const homeStarId = GameHelper.getPlayerHomeStar(
        userPlayer.value,
        game.value.galaxy.stars,
      )?._id;
      if (homeStarId) {
        store.setMenuState({ state: "starDetail", starId: homeStarId });
      }

      eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, {
        player: userPlayer.value,
      });
    }
  };

  const fitGalaxy = () => {
    eventBus.emit(MapCommandEventBusEventNames.MapCommandFitGalaxy, {});
  };

  return (e: KeyboardEvent) => {
    if (
      /^(?:input|textarea|select|button)$/i.test(
        (e.target as HTMLElement).tagName,
      )
    ) {
      return;
    }

    const key = e.key;

    // Check for modifier keys and ignore the keypress if there is one.
    if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
      return;
    }

    const isLoggedIn = userStore.isLoggedIn;

    let cmd = KEYBOARD_SHORTCUTS.all[key];

    if (isLoggedIn) {
      cmd = cmd || KEYBOARD_SHORTCUTS.user[key];
    }

    if (userPlayer.value) {
      cmd = cmd || KEYBOARD_SHORTCUTS.player[key];
    }

    if (cmd === null) {
      return;
    }

    if (cmd.cmd === "setMenuState") {
      store.setMenuState(cmd.state);
    } else if (cmd.cmd === "setChatState") {
      store.setMenuStateChat(cmd.state);
    } else if (cmd.cmd === "mapCommand") {
      switch (cmd.command) {
        case "fitGalaxy":
          fitGalaxy();
          break;
        case "panToHomeStar":
          panToHomeStar();
          break;
        case "zoomIn":
          eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomIn, {});
          break;
        case "zoomOut":
          eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomOut, {});
          break;
      }
    }
  };
};
