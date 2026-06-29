import { computed, type Ref } from "vue";
import type { Game, Player } from "@/types/game";
import type { SortInfo } from "@/services/data/sortInfo";
import GridHelper from "@/services/gridHelper";

export const missingPropertyFallbackFunc =
  (playersMap: Ref<Map<string, Player>>) => (obj: Object, key: string) => {
    switch (key) {
      case "ownedByPlayer":
        return playersMap.value.get(obj["ownedByPlayerId"]);
      default:
        return null;
    }
  };

export const usePlayerMap = (game: Ref<Game>) =>
  computed(() => new Map(game.value.galaxy.players.map((p) => [p._id, p])));

export const useSorted = <A extends Object>(
  game: Ref<Game>,
  tableData: Ref<A[]>,
  sortInfo: Ref<SortInfo>,
) => {
  return computed(() =>
    GridHelper.dynamicSort(
      tableData.value,
      sortInfo.value,
      missingPropertyFallbackFunc(usePlayerMap(game)),
    ),
  );
};
