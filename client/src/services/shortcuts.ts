import { inject, computed } from "vue";
import { useUserStore } from "@/stores/user.ts";
import { useGameStore } from "@/stores/game.ts";
import { eventBusInjectionKey } from "@/eventBus.ts";
import KEYBOARD_SHORTCUTS from "./data/keyboardShortcuts";
import { MapCommandEventBusEventNames } from "@solaris/map-rendering";
import GameHelper from "@/services/gameHelper.ts";
import type { MenuState } from "@/types/menu.ts";

export const createKeyboardShortcutHandler = () => {
  const userStore = useUserStore();
  const store = useGameStore();
  const eventBus = inject(eventBusInjectionKey)!;

  const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
  const game = computed(() => store.game!);

  const gameIsFinished = computed(() => GameHelper.isGameFinished(game.value));

  const setMenuState = (newState: MenuState) => {
    store.setMenuState(newState);
  };

  const panToHomeStar = () => {
    if (userPlayer.value) {
      const homeStarId = GameHelper.getPlayerHomeStar(
        userPlayer.value,
        game.value.galaxy.stars,
      )?._id;
      if (homeStarId) {
        setMenuState({ state: "starDetail", starId: homeStarId });
      }

      eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, {
        player: userPlayer.value,
      });
    }
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
    const isInGame = userPlayer.value != null;

    let menuState = KEYBOARD_SHORTCUTS.all[key];

    const fitGalaxy = () => {
      eventBus.emit(MapCommandEventBusEventNames.MapCommandFitGalaxy, {});
    };

    if (menuState === null) {
      setMenuState({ state: "none" });
      return;
    }

    if (isLoggedIn) {
      menuState = menuState || KEYBOARD_SHORTCUTS.user[key];
    }

    // Handle keyboard shortcuts for screens only available for users
    // who are players.
    if (isInGame) {
      menuState = menuState || KEYBOARD_SHORTCUTS.player[key];
    }

    if (!menuState) {
      return;
    }

    if (menuState === "inbox") {
      store.setMenuStateChat({ state: "inbox" });
    }

    // Special case for intel, which is not accessible for dark mode extra games.
    if (
      menuState === "intel" &&
      GameHelper.isDarkModeExtra(game.value) &&
      !gameIsFinished.value
    ) {
      return;
    }

    switch (menuState) {
      case null:
        setMenuState({ state: "none" });
        break;
      case "HOME_STAR":
        panToHomeStar();
        break;
      case "FIT_GALAXY":
        fitGalaxy();
        break;
      case "ZOOM_IN":
        eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomIn, {});
        break;
      case "ZOOM_OUT":
        eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomOut, {});
        break;
      default:
        setMenuState({ state: menuState });
        break;
    }
  };
};
