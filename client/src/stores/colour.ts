import { computed, readonly, ref } from 'vue';
import { defineStore } from 'pinia';
import type { PlayerColour } from '@solaris-common';
import { formatError, isOk } from '@/services/typedapi';
import { addColour, listColours } from '@/services/typedapi/colour';
import type { Axios } from 'axios';
import type { EventBus } from '@/eventBus';
import GameCommandEventBusEventNames from '@/eventBusEventNames/gameCommand';
import GameHelper from '@/services/gameHelper';
import type { Game, Player } from '@/types/game';
import type { UserGameSettings } from '@solaris-common';

export const useColourStore = defineStore('colour', () => {
    // State
    const colourOverride = ref<boolean>(true);
    const coloursConfig = ref<PlayerColour[] | null>(null);
    const colourMapping = ref<Record<string, PlayerColour>>({});

    // Actions
    const setColourOverride = (value: boolean, eventBus: EventBus, game: Game | null, settings: UserGameSettings | null) => {
        colourOverride.value = value;

        if (game) {
            eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadGame, { game, settings });
        }
    };

    const setColoursConfig = (data: PlayerColour[]) => {
        coloursConfig.value = data;
    };

    const setColourMappingFromGame = (game: Game) => {
        colourMapping.value = { ...GameHelper.getColourMapping(game) };
    };

    const clearColourState = () => {
        colourOverride.value = true;
        colourMapping.value = {};
    };

    const loadColourData = async (httpClient: Axios) => {
        const resp = await listColours(httpClient)();
        if (isOk(resp)) {
            coloursConfig.value = resp.data;
        } else {
            console.error(formatError(resp));
        }
    };

    const addColourMapping = async (
        httpClient: Axios,
        eventBus: EventBus,
        game: Game,
        settings: UserGameSettings | null,
        data: { playerId: string; colour: PlayerColour }
    ) => {
        const resp = await addColour(httpClient)(game._id, data.playerId, data.colour);
        if (isOk(resp)) {
            colourMapping.value = {
                ...colourMapping.value,
                [data.playerId]: data.colour,
            };

            eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadGame, { game, settings });
        } else {
            console.error(formatError(resp));
        }
    };

    // Getter
    const getColourForPlayer = (game: Game | null, playerId: string): { alias: string; value: string } | null => {
        let colour: { alias: string; value: string } | null = null;

        if (colourOverride.value) {
            colour = colourMapping.value?.[playerId] || GameHelper.getPlayerById(game!, playerId)!.colour;
        } else {
            colour = GameHelper.getPlayerById(game!, playerId)!.colour;
        }

        if (colour != null) {
            colour.value = GameHelper.getFriendlyColour(colour.value);
        }

        return colour;
    };

    return {
        // State (readonly)
        colourOverride: readonly(colourOverride),
        coloursConfig: readonly(coloursConfig),
        colourMapping: readonly(colourMapping),

        // Actions
        setColourOverride,
        setColoursConfig,
        setColourMappingFromGame,
        clearColourState,
        loadColourData,
        addColourMapping,

        // Getter
        getColourForPlayer,
    };
});
